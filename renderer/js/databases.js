const g =document.getElementById.bind(document);

const databaseList = g('databaseList'),
    newDatabaseBtn = g('newDatabaseBtn'),
    newDatabaseContainer = g('newDatabaseContainer'),
    dbName = g('dbName'),
    addDatabaseBtn = g('addDatabaseBtn'),
    dbVisibility = g('dbVisibility'),
    newRemoteDbBtn = g('newRemoteDbBtn'),
    newRemoteDbContainer = g('newRemoteDbContainer'),
    remoteDatabasesList = g('remoteDatabasesList'),
    searchingSpan = g('searchingSpan');

//general functions
refreshDbList();
function refreshDbList(){
    databaseList.innerHTML = '';
    const databases = store.getAll();

    for (const database in databases) {
        databaseList.innerHTML += `
            <div class="listItem dbItem" onclick="openDb(event, '${database}'${databases[database].type == 'remote' ? `, true, '${databases[database].ip}'` : ''})">
                <strong>${databases[database].type == 'local' ? database : database.slice(7)}</strong>
                <button class="actionBtn" onclick="deleteDb(\`${database}\`)">Delete</button>
                <div>
                    <span class="dbType ${databases[database].type}">${databases[database].type}</span>
                    <span class="dbVisibility">${databases[database].type == 'local' ? databases[database].visibility : databases[database].ip}</span>
                </div>
            </div>
        `;
    }

    if (databaseList.children.length === 0) databaseList.innerHTML += `<div class="emptyPlaceholder">No databases</div`;
}
function openDb(event, database, isRemote = false, ip = undefined){
    if (event.target.tagName !== 'BUTTON') location.href = `../html/items.html?db=${database}&remote=${isRemote}${ip ? `&ip=${ip}` : ''}`;
}
function deleteDb(database) {
    store.delete(database);
    fs.unlink(`./renderer/databases/db_${database}`, error => {
        if (error) console.error(error);
        refreshDbList();
    });
}

//add new database
newDatabaseBtn.addEventListener('click', () => {
    newDatabaseContainer.style.display = 'flex';
    dbName.focus();
});
newDatabaseContainer.addEventListener('click', event => {
    if (event.target === newDatabaseContainer) newDatabaseContainer.style.display = 'none';
});
newDatabaseContainer.addEventListener('keydown', event => {
    if (event.code === 'Enter') addDb();
});
addDatabaseBtn.addEventListener('click', addDb);
function addDb(){
    if (dbName.value.trim().length < 1){
        dialog.showErrorBox('Please enter a database name');
        return;
    }
    if (store.get(dbName.value)){
        dialog.showErrorBox('Database name already exists');
        return;
    }
    const obj = {};
    obj[dbName.value] = {
        type: 'local',
        visibility: dbVisibility.value,
        new: true
    }
    store.set(obj);

    newDatabaseContainer.style.display = 'none';
    dbName.value = '';
    dbVisibility.value = 'private';
    refreshDbList();
}

//new remote database
newRemoteDbBtn.addEventListener('click', () => {
    newRemoteDbContainer.style.display = 'flex';
    remoteDatabasesList.innerHTML = '';
    searchingSpan.style.display = 'inline';

    network.networkSearch(1210, addresses => {
        searchingSpan.style.display = 'none';
        addresses = addresses.flat();

        addresses.forEach(address => {
            ws.requestName(address, data => {
                data = new TextDecoder().decode(data);
                remoteDatabasesList.innerHTML += `
                    <div class="remoteDbListItem" onclick="addRemoteDb('${address}', '${data}')">
                        <span class="remoteDbName">${data}</span>
                        <em class="remoteDbIP">${address}</em>
                    </div>
                `;
            });
        });
    });
});
newRemoteDbContainer.addEventListener('click', event => {
    if (event.target === newRemoteDbContainer) newRemoteDbContainer.style.display = 'none';
});
function addRemoteDb(ip, name){
    if (store.get(`remote_${name}`)){
        dialog.showErrorBox('Database name already exists');
        return;
    }
    const obj = {};
    obj[`remote_${name}`] = {
        type: 'remote',
        ip
    }
    store.set(obj);

    newRemoteDbContainer.style.display = 'none';
    refreshDbList();
}