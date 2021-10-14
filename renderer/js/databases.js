const databaseList = document.getElementById('databaseList');

refreshDbList();
function refreshDbList(){
    databaseList.innerHTML = '';
    const databases = store.getAll();

    for (const database in databases) {
        databaseList.innerHTML += `<div class="database"><strong>${database}</strong> - <em>${databases[database].type}</em><button class="viewDbBtn" onclick="openDb(\`${database}\`)">View</button><button class="deleteDbBtn" onclick="deleteDb(\`${database}\`)">Delete</button></div>`
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
function openDb(databaseName){
    backToDatabasesBtn.style.display = 'inline-block';
    databaseListContainer.style.display = 'none';
    databaseContainer.style.display = 'block';

    document.querySelector('.pageTitle').innerText = databaseName;

    const dbInfo = store.get(databaseName);
    db.openDb(databaseName);
    
    if (dbInfo.new) {
        db.initialise();
        dbInfo.new = false;
        const obj = {};
        obj[databaseName] = dbInfo;
        store.set(obj);
    }
    
    //setTimeout(() => console.log('get all: ', db.getAll()), 3000)
}