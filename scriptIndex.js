(function script() {
    let filter = {
        searchString: '',
        column: 'id',
        sortType: 'asc'
    };
    let clients;
    let clientsTable;
    let tr;
    let td;
    let button;
    let img;
    let ths;

    function applyFilter() {
        const isAsc = filter.sortType === 'asc' ? true : false;
        switch(filter.column) {
            case 'id':
            case 'createdDatetime':
            case 'changedDatetime':
                clients.sort(function (a, b) {
                    let aValue = filter.column === 'id' ? a.id 
                        : new Date(filter.column === 'createdAt' 
                            ? a.createdAt : a.updatedAt);
                    let bValue = filter.column === 'id' ? b.id 
                        : new Date(filter.column === 'createdAt' 
                            ? b.createdAt : b.updatedAt);
                    return isAsc ? bValue - aValue 
                        : aValue - bValue;
                });
                break;
            case 'fio':
                clients.sort(function (a, b) {
                    let nameA = `${a.surname} ${a.name} ${a.lastName}`.toLowerCase();
                    let nameB = `${b.surname} ${b.name} ${b.lastName}`.toLowerCase();
                    return nameA < nameB ? (isAsc ? -1 : 1) 
                        : nameA > nameB ? (isAsc ? 1 : -1) 
                        : 0;
                    })
                break;
            default:
                break;
        }
        let filteredClients = clients.filter(item => item.id.indexOf(filter.searchString) !== -1 
            || `${item.surname} ${item.name} ${item.lastName}`.toLowerCase().indexOf(filter.searchString) !== -1
            || new Date(item.createdAt).toLocaleString().replaceAll(',','').indexOf(filter.searchString) !== -1
            || new Date(item.updatedAt).toLocaleString().replaceAll(',','').indexOf(filter.searchString) !== -1);
        fillClients(filteredClients);
    }

    function createContactIcon(src, type, value = '') {
        img = document.createElement('img');
        img.src = src;
        //img.setAttribute('contact-type', type);
        //img.setAttribute('contact-value', value);
        
        if (type === 'count') {
            img.addEventListener('click', function(e) {
                const hideElements = e.currentTarget.parentElement.querySelectorAll('img.hide');
                for (let hideElement of hideElements) {
                    hideElement.classList.toggle('hide');
                }
                document.querySelector('#contactBlock_2').classList.toggle('hide');
                e.currentTarget.classList.toggle('hide');
            });
        } else {
            img.setAttribute('data-bs-toggle', 'tooltip');
            img.setAttribute('data-bs-placement', 'top');
            img.setAttribute('data-bs-html', 'true');
            img.setAttribute('title', `${type}: <b>${value}</b>`);
        }
        return img;
    }

    function createButtonWithImage(name, src, innerHTML) {
        button = document.createElement('button');
        button.name = name;
        img = document.createElement('img');
        img.src = src;
        button.append(img);
        button.innerHTML += innerHTML;
        return button;
    }

    function fillContacts(td, contacts) {
        for (const {type, value} of contacts) {
            switch(type) {
                case 'Телефон':
                    td.append(createContactIcon('./content/contacts/phone.svg', type, value));                   
                    break;
                case 'Email':
                    td.append(createContactIcon('./content/contacts/mail.svg', type, value));
                    break;
                case 'Facebook':
                    td.append(createContactIcon('./content/contacts/fb.svg', type, value));
                    break;
                case 'VK':
                    td.append(createContactIcon('./content/contacts/vk.svg', type, value));
                    break;
                default :
                    td.append(createContactIcon('./content/contacts/default.svg', type, value));
                break;
            }
        }
        let contactElements = td.querySelectorAll('img');
        let contactBlock_1 = document.createElement('div');
        contactBlock_1.id = 'contactBlock_1';    
        contactBlock_1.style.display = 'inline';

        if (contactElements.length > 4) {
            let contactBlock_2 = document.createElement('div');
            contactBlock_2.id = 'contactBlock_2';
            contactBlock_2.classList.toggle('hide');
            for (let i = 0; i < contactElements.length; i++) {
                if (i === 4) {
                    contactElements[i].classList.toggle('hide');
                }
                if (i <= 4) {
                  contactBlock_1.append(contactElements[i]);
                  contactBlock_1.innerHTML += '\n';               
                }                
                if (i > 4) {                    
                  contactBlock_2.append(contactElements[i]);
                  contactBlock_2.innerHTML += '\n';
                }                
            }
            td.append(contactBlock_1, createContactIcon(`./content/contacts/plus${contactElements.length - 4}.svg`, 'count'), contactBlock_2);
        } else {
            for (let i = 0; i < contactElements.length; i++) {
              contactBlock_1.append(contactElements[i]);
              contactBlock_1.innerHTML += '\n';
            }            
            td.append(contactBlock_1);
        }
        return td;
    }

    function createTd(name, innerHTML, contacts = null) {
        td = document.createElement('td');
        td.setAttribute('name', name);

        if (name === 'actions') {            
            td.append(createButtonWithImage('editButton', './content/edit.svg', 'Изменить'));
            td.append(createButtonWithImage('deleteButton', './content/cancel.svg', 'Удалить'));
        } else if (name === 'contacts') {
            td = fillContacts(td, contacts);
        } else {
            td.innerHTML = innerHTML;
        }
        return td;
    }

    function addClientToTable(client) {
        tr = document.createElement('tr');
        tr.append(createTd('id', client.id));
        tr.append(createTd('fio', `${client.surname} ${client.name} ${client.lastName}`));
        tr.append(createTd('createdDatetime', `${new Date(client.createdAt).toLocaleDateString()} <p>${new Date(client.createdAt).toLocaleTimeString([], {timeStyle: 'short'})}</p>`));
        tr.append(createTd('changedDatetime', `${new Date(client.updatedAt).toLocaleDateString()} <p>${new Date(client.updatedAt).toLocaleTimeString([], {timeStyle: 'short'})}</p>`));
        tr.append(createTd('contacts', '', client.contacts));
        tr.append(createTd('actions', ''));        
        tr.append(td);
        clientsTable.querySelector('tBody').append(tr);
    }

    function fillClients(clients) {
        clientsTable.querySelector('tBody').innerHTML = '';
        for (const client of clients) {
            addClientToTable(client);
        }
        initializeTooltips();
    }

    async function getClients() {
        const responce = await fetch(`http://localhost:3000/api/clients`);
        return await responce.json();
    }

    function initializeTooltips() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        });
    }

    function initializeSort() {
        ths = document.querySelectorAll('th[isSort="true"');
        for (let th of ths) {
            th.addEventListener('click', function(e) {      
                let sortType;
                let imgEl = e.currentTarget.querySelectorAll('img');       
                if (imgEl.length > 1) {
                    sortType = e.currentTarget.querySelector('img.sortFio') === null 
                        ? '' : (e.currentTarget.querySelector('img.sortFio').name === 'sortFioAsc' 
                            ? 'sortDesc' : 'sortAsc');
                } else {
                    sortType = imgEl[0].className;
                }
                                
                for (let th of ths) {
                    th.className = '';
                    let imgs = th.querySelectorAll('img');
                    for (let img of imgs) {
                      img.className = 'sortHide';
                    }
                };
                e.currentTarget.className = 'sort';
                sortType = sortType === 'sortAsc' ? 'sortDesc' : 'sortAsc';
                filter.sortType = sortType === 'sortAsc' ? 'desc' : 'asc';
                
                if (imgEl.length > 1) {
                    imgEl[sortType === 'sortAsc' ? 1 : 0].className = 'sortFio';
                    filter.column = 'fio';
                } else {
                    imgEl[0].className = sortType;
                    filter.column = imgEl[0].parentElement.getAttribute('name');
                }
                applyFilter();
            });
        }        
    }
    
    async function initialization() {
        clientsTable = document.querySelector('#clientsTable');

        clients = await getClients();
        if (clients.length !== 0) {
          fillClients(clients);          
        } else {
          //"Клиенты отсутствуют";
        }
        initializeSort();

        document.querySelector('#searchInput').addEventListener('input', function(e) {
            filter.searchString = e.currentTarget.value.toLowerCase();
            applyFilter();
        })
    }

    document.addEventListener('DOMContentLoaded', initialization);
}());
