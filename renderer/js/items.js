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
    deleteItemBtn = g('deleteItemBtn'),
    onlineStatus = g('onlineStatus'),
    onlineStatusDiv = g('onlineStatusDiv'),
    remoteDiv = g('remoteDiv'),
    connectingDiv = g('connectingDiv'),
    syncBtn = g('syncBtn');

//get database name from data sent by databases page
const searchParams = new URLSearchParams(location.search);
const databaseName =  searchParams.get('db');
document.querySelector('.pageTitle').innerText = searchParams.get('remote') === 'true' ? databaseName.slice(7) : databaseName;

if (searchParams.get('remote') === 'false') {

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

    //show connection status if public database
    if (dbInfo.visibility === 'public'){
        onlineStatusDiv.style.display = 'block';

        onlineStatus.addEventListener('click', () => {
            if (ws.isOnline()) {
                //close down database
                ws.closeServer();
                onlineStatus.innerText = 'Offline';
                onlineStatus.classList.remove('online');
                onlineStatus.classList.add('offline');
            } else {
                //open database
                ws.host(databaseName, db.getAll);
                onlineStatus.innerText = 'Online';
                onlineStatus.classList.remove('offline');
                onlineStatus.classList.add('online');
            }
        });
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
            dialog.showErrorBox('Please fill in all required fields');
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
            dialog.showErrorBox(e.toString());
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
            dialog.showErrorBox('Please fill in all required fields');
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
            dialog.showErrorBox(e.toString());
            return;
        }
        editItemContainer.style.display = 'none';

        refreshItemList();
    }
    deleteItemBtn.addEventListener('click', deleteItem);
    function deleteItem(){
        db.deleteItem(itemIdDisplay.value);
        refreshItemList();
        editItemContainer.style.display = 'none';
    }

    //general functions
    refreshItemList();
    function refreshItemList() {
        const data = db.getAll();
        numberOfItems.innerText = data.length + ' items';

        itemList.innerHTML = '';

        data.forEach(createItemList);

        if (itemList.children.length === 0) itemList.innerHTML += `<div class="emptyPlaceholder">No items</div`;

    }
} else {
    remoteDiv.style.display = 'block';
    connectingDiv.style.display = 'block';
    itemSearch.style.display = 'none';
    document.querySelector('.container').style.display = 'none';

    ws.connect(searchParams.get('ip')).then(() => {
        connectingDiv.style.display = 'none';
        document.querySelector('.container').style.display = 'block';

        ws.initialise(syncData);
        ws.sync();
    });

    syncBtn.addEventListener('click', () => {
        itemList.innerHTML = '';
        syncBtn.style.display = 'none';
        ws.sync();
    });

    function syncData(message){
        message = new TextDecoder().decode(message);
        if (message === 'end') {
            numberOfItems.innerText = itemList.children.length + ' items';
            syncBtn.style.display = 'inline';
        } else {
            createRemoteItemList(JSON.parse(message), true);
        }
    }
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
        if (item.ItemName.toLowerCase().includes(searchTerm) || item.ItemCode.toLowerCase().includes(searchTerm)) createItemList(item);
    });
}

function createItemList(item){
    itemList.innerHTML += ` 
        <div class="listItem id${item.ItemID}" onclick="openItem(event, ${item.ItemID})">
            <span class="itemCodeListDisplay">${item.ItemCode}</span> | 
            <strong>${item.ItemName}</strong>
            <span class="itemQuantity">Quantity: ${item.ItemQuantity}</span>
            <div>
                <em class="itemDescription">${item.ItemDescription}</em> 
            </div>
        </div>
    `;
    const description = document.querySelector(`.id${item.ItemID} em`);
    if (description.offsetWidth > (window.innerWidth - 350)) description.innerText = `${description.innerText.slice(0, Math.ceil(description.innerText.length / description.offsetWidth * (window.innerWidth - 350)))}...`;
}
function createRemoteItemList(item){
    itemList.innerHTML += ` 
        <div class="listItem id${item.ItemID}">
            <span class="itemCodeListDisplay">${item.ItemCode}</span> | 
            <strong>${item.ItemName}</strong>
            <span class="itemQuantity">Quantity: ${item.ItemQuantity}</span>
            <div>
                <em class="itemDescription">${item.ItemDescription}</em> 
            </div>
        </div>
    `;
    const description = document.querySelector(`.id${item.ItemID} em`);
    if (description.offsetWidth > (window.innerWidth - 350)) description.innerText = `${description.innerText.slice(0, Math.ceil(description.innerText.length / description.offsetWidth * (window.innerWidth - 350)))}...`;
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