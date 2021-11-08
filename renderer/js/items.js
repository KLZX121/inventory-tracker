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
    itemSearch = g('itemSearch');

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
    itemNameInput.focus();
});
newItemContainer.addEventListener('keydown', event => {
    if (event.code === 'Enter') addNewItem();
});
newItemContainer.addEventListener('click', event => {
    if (event.target === newItemContainer) newItemContainer.style.display = 'none';
});
addItemBtn.addEventListener('click', addNewItem);

function addNewItem(){
    if (!itemNameInput.value.trim() || !itemQuantity.value) {
        dialog.showMessageBox({message: 'Please fill in all required fields', type: 'error', title: 'Error'});
        return;
    }
    try {
        db.insert({
            itemName: itemNameInput.value,
            itemDescription: itemDescription.value,
            itemQuantity: itemQuantity.value
        });
    } catch (e) {
        dialog.showMessageBox({message: e.toString(), type: 'error', title: 'Error'});
        return;
    }
    newItemContainer.style.display = 'none';

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
    if (!editItemName.value.trim() || !editItemQuantity.value) {
        dialog.showMessageBox({message: 'Please fill in all required fields', type: 'error', title: 'Error'});
        return;
    }
    try {
        db.update({
            itemId: parseInt(itemIdDisplay.value),
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
    editItemName.value = itemData.ItemName;
    editItemDescription.value = itemData.ItemDescription;
    editItemQuantity.value = itemData.ItemQuantity;

    editItemName.focus();
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
    itemList.innerHTML = '';

    data.forEach(createItemList);
}
function createItemList(item){
    itemList.innerHTML += ` 
        <div class="listItem" onclick="openItem(event, ${item.ItemID})">
            <span>${item.ItemID}</span> | 
            <strong>${item.ItemName}</strong>
            <button class="actionBtn" onclick="deleteItem('${item.ItemID}')">Delete</button>
            <div>
                <em style="font-size: 0.9em">${item.ItemDescription || '&nbsp'}</em> 
                <span style="float: right; font-size: 0.9em; margin-top: 0.1em">Quantity: ${item.ItemQuantity}</span>
            </div>
        </div>
    `;
    const description = document.querySelector(`[onclick="openItem(event, ${item.ItemID})"] em`);
    if (description.offsetWidth > 450) description.innerText = `${description.innerText.slice(0, Math.ceil(description.innerText.length / description.offsetWidth * 450))}...`;
}
function deleteItem(itemId){
    db.deleteItem(itemId);
    refreshItemList();
}