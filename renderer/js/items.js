const g = document.getElementById.bind(document);

const addNewItemBtn = g('addNewItemBtn'),
    itemList = g('itemList');

const databaseName = new URLSearchParams(location.search).get('db');
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

addNewItemBtn.addEventListener('click', addNewItem);

function addNewItem(){

    db.insert({
        itemName: Math.random(),
        itemDescription: 'Test',
        itemQuantity: 1
    })

    refreshItemList();
}

refreshItemList();
function refreshItemList() {
    const data = db.getAll();
    itemList.innerHTML = '';

    data.forEach(item => {
        itemList.innerHTML += `
            <div class="listItem">
                <span>${item.ItemID}</span> | 
                <strong>${item.ItemName}</strong>
                <button class="actionBtn" onclick="deleteItem('${item.ItemID}')">Delete</button>
                <div>
                    <em>${item.ItemDescription}</em> 
                    <span>Quantity: ${item.ItemQuantity}</span>
                </div>
            </div>
        `;
    });
}

function deleteItem(itemId){
    db.deleteItem(itemId);
    refreshItemList();
}