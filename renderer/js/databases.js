const g =document.getElementById.bind(document);

const databaseList = g('databaseList'),
    newDatabaseBtn = g('newDatabaseBtn'),
    dbName = g('dbName'),
    addDatabaseBtn = g('addDatabaseBtn'),
    dbVisibility = g('dbVisibility');

//general functions
refreshDbList();
function refreshDbList(){
    databaseList.innerHTML = '';
    const databases = store.getAll();

    for (const database in databases) {
        databaseList.innerHTML += `
            <div class="listItem dbItem" onclick="openDb(event, '${database}')">
                <strong>${database}</strong>
                <button class="actionBtn" onclick="deleteDb(\`${database}\`)">Delete</button>
                <div>
                    <span class="dbType ${databases[database].type == 'local' ? 'local' : 'remote'}">${databases[database].type}</span>
                    ${databases[database].type == 'local' ? `<span class="dbVisibility">${databases[database].visibility}</span>` : ''}
                </div>
            </div>
        `;
    }
}
function openDb(event, database){
    if (event.target.tagName !== 'BUTTON') location.href = `../html/items.html?db=${database}`;
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
        dialog.showMessageBox({message: 'Please enter a database name', type: 'error', title: 'Error'});
        return;
    }
    if (store.get(dbName.value)){
        dialog.showMessageBox({message: 'Database name already exists', type: 'error', title: 'Error'});
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
