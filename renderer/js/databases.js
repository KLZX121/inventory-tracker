const databaseList = document.getElementById('databaseList');

refreshDbList();
function refreshDbList(){
    databaseList.innerHTML = '';
    const databases = store.getAll();

    for (const database in databases) {
        databaseList.innerHTML += `
            <div class="listItem">
                <strong>${database}</strong> - 
                <em>${databases[database].type}</em>
                <button class="actionBtn" onclick="location.href = \`../html/items.html?db=${database}\`">View</button>
                <button class="actionBtn" onclick="deleteDb(\`${database}\`)">Delete</button>
            </div>
        `
    }
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
