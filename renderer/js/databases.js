const databaseList = document.getElementById('databaseList');

refreshDbList();
function refreshDbList(){
    databaseList.innerHTML = '';
    const databases = store.getAll();

    for (const database in databases) {
        databaseList.innerHTML += `
            <div class="listItem" onclick="openDb(event, '${database}')">
                <strong>${database}</strong> 
                <button class="actionBtn" onclick="deleteDb(\`${database}\`)">Delete</button>
                <div>${databases[database].type}</div>
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

const newDatabaseBtn = document.getElementById('newDatabaseBtn');
const dbName = document.getElementById('dbName');

newDatabaseBtn.addEventListener('click', newDb);

function newDb(){
    if (dbName.value.trim().length < 1) return;
    const obj = {};
    obj[dbName.value] = {
        type: 'local',
        new: true
    }
    store.set(obj);

    dbName.value = '';

    refreshDbList();
}
