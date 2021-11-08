const g = document.getElementById.bind(document);

const newItemBtn = g('newItemBtn'),
    itemList = g('itemList'),
    newItemContainer = g('newItemContainer'),
    addItemBtn = g('addItemBtn'),
    itemNameInput = g('itemNameInput'),
    itemDescription = g('itemDescription'),
    itemQuantity = g('itemQuantity'),
    editItemContainer = g('editItemContainer'),
    itemName = g('itemName'),
    editItemName = g('editItemName'),
    editItemDescription = g('editItemDescription'),
    editItemQuantity = g('editItemQuantity'),
    saveItemBtn = g('saveItemBtn'),
    itemIdDisplay = g('itemIdDisplay'),
    itemSearch = g('itemSearch'),
    numberOfItems = g('numberOfItems'),
    itemCode = g('itemCode'),
    editItemCode = g('editItemCode'),
    deleteItemBtn = g('deleteItemBtn');

//get database name from data sent by databases page
const databaseName = new URLSearchParams(location.search).get('db');
document.querySelector('.pageTitle').innerText = databaseName;

const dbInfo = store.get(databaseName);
db.openDb(databaseName);

//setup database if it is new
if (dbInfo.new) {
    db.initialise();
    dbInfo.new = false;
    const obj = {};
    obj[databaseName] = dbInfo;
    store.set(obj);
}

//functions for adding new item
newItemBtn.addEventListener('click', () => {
    newItemContainer.style.display = 'flex';
    let id = ((db.getId()?.seq || 0) + 1).toString();
    while (id.length < 4) id = `0${id}`;
    itemCode.value = `BF${id}`;
    itemNameInput.focus();
});
newItemContainer.addEventListener('click', event => {
    if (event.target === newItemContainer) newItemContainer.style.display = 'none';
});
newItemContainer.addEventListener('keydown', event => {
    if (event.code === 'Enter') addNewItem();
});

addItemBtn.addEventListener('click', addNewItem);
function addNewItem(){
    if (!itemNameInput.value.trim() || !itemQuantity.value || !itemCode.value.trim()) {
        dialog.showMessageBox({message: 'Please fill in all required fields', type: 'error', title: 'Error'});
        return;
    }
    try {
        db.insert({
            itemCode: itemCode.value,
            itemName: itemNameInput.value,
            itemDescription: itemDescription.value,
            itemQuantity: parseInt(itemQuantity.value)
        });
    } catch (e) {
        dialog.showMessageBox({message: e.toString(), type: 'error', title: 'Error'});
        return;
    }
    newItemContainer.style.display = 'none';

    itemCode.value = '';
    itemNameInput.value = '';
    itemDescription.value = '';
    itemQuantity.value = 0;
    refreshItemList();
}

//functions for editing item
editItemContainer.addEventListener('click', event => {
    if (event.target === editItemContainer) editItemContainer.style.display = 'none';
});
editItemContainer.addEventListener('keydown', event => {
    if (event.code === 'Enter') editItem();
});
saveItemBtn.addEventListener('click', editItem);
function editItem(){
    if (!editItemName.value.trim() || !editItemQuantity.value || !editItemCode.value.trim()) {
        dialog.showMessageBox({message: 'Please fill in all required fields', type: 'error', title: 'Error'});
        return;
    }
    try {
        db.update({
            itemId: itemIdDisplay.value,
            itemCode: editItemCode.value,
            itemName: editItemName.value,
            itemDescription: editItemDescription.value,
            itemQuantity: parseInt(editItemQuantity.value)
        });
    } catch (e) {
        dialog.showMessageBox({message: e.toString(), type: 'error', title: 'Error'});
        return;
    }
    editItemContainer.style.display = 'none';

    refreshItemList();
}
function openItem(event, itemId){
    if (event.target.tagName === 'BUTTON') return;
    editItemContainer.style.display = 'flex';

    const itemData = db.get(itemId);
    
    itemIdDisplay.value = itemId;
    editItemCode.value = itemData.ItemCode;
    editItemName.value = itemData.ItemName;
    editItemDescription.value = itemData.ItemDescription;
    editItemQuantity.value = itemData.ItemQuantity;

    editItemName.focus();
}
deleteItemBtn.addEventListener('click', deleteItem);
function deleteItem(){
    db.deleteItem(itemIdDisplay.value);
    refreshItemList();
    editItemContainer.style.display = 'none';
}

//search items
itemSearch.addEventListener('keydown', event => {
    if (event.code === 'Enter') searchItems();
});
itemSearch.addEventListener('input', () => {
    if (!itemSearch.value) refreshItemList();
    else searchItems();
});
function searchItems() {
    const searchTerm = itemSearch.value.trim().toLowerCase();
    const data = db.getAll();
    itemList.innerHTML = '';

    data.forEach(item => {
        if (item.ItemName.toLowerCase().includes(searchTerm)) createItemList(item);
    });
}

//general functions
refreshItemList();
function refreshItemList() {
    const data = db.getAll();
    numberOfItems.innerText = data.length + ' items';

    itemList.innerHTML = '';

    data.forEach(createItemList);
}
function createItemList(item){
    itemList.innerHTML += ` 
        <div class="listItem" onclick="openItem(event, ${item.ItemID})">
            <span class="itemCodeListDisplay">${item.ItemCode}</span> | 
            <strong>${item.ItemName}</strong>
            <span class="itemQuantity">Quantity: ${item.ItemQuantity}</span>
            <div>
                <em class="itemDescription">${item.ItemDescription}</em> 
            </div>
        </div>
    `;
    const description = document.querySelector(`[onclick="openItem(event, ${item.ItemID})"] em`);
    if (description.offsetWidth > (window.innerWidth - 350)) description.innerText = `${description.innerText.slice(0, Math.ceil(description.innerText.length / description.offsetWidth * (window.innerWidth - 350)))}...`;
}