const g = document.getElementById.bind(document);

const newItemBtn = g('newItemBtn'),
    itemList = g('itemList'),
    newItemContainer = g('newItemContainer'),
    addItemBtn = g('addItemBtn'),
    itemNameInput = g('itemNameInput'),
    itemDescription = g('itemDescription'),
    itemQuantity = g('itemQuantity');

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

newItemContainer.addEventListener('click', event => {
    if (event.target === newItemContainer) newItemContainer.style.display = 'none';
});
addItemBtn.addEventListener('click', addNewItem);

function addNewItem(){
    if (!itemNameInput.value.trim() || !itemQuantity.value) {
        dialog.showMessageBox({message: 'Please fill in all required fields', type: 'error', title: 'Error'})
        return;
    }
    newItemContainer.style.display = 'none';
    db.insert({
        itemName: itemNameInput.value,
        itemDescription: itemDescription.value,
        itemQuantity: itemQuantity.value
    });

    itemNameInput.value = '';
    itemDescription.value = '';
    itemQuantity.value = 0;
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