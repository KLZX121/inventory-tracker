const g = document.getElementById.bind(document);

const newItemBtn = g('newItemBtn'),
    itemList = g('itemList'),
    newItemContainer = g('newItemContainer'),
    addItemBtn = g('addItemBtn'),
    itemNameInput = g('itemNameInput'),
    itemDescription = g('itemDescription'),
    itemQuantity = g('itemQuantity');

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
                    <em>${item.ItemDescription || "&nbsp"}</em> 
                    <span style="float: right">Quantity: ${item.ItemQuantity}</span>
                </div>
            </div>
        `;
    });
}

function deleteItem(itemId){
    db.deleteItem(itemId);
    refreshItemList();
}