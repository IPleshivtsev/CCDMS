(function script() {
    let clientsTable;
    let tr;
    let td;
    let button;
    let img;

    function createContactIcon(src, type, value = '') {
        img = document.createElement('img');
        img.src = src;
        img.setAttribute('contact-type', type);
        img.setAttribute('contact-value', value);

        if (type === 'count') {
            img.addEventListener('click', function(e) {
                const hideElements = e.currentTarget.parentElement.querySelectorAll('img.hide');
                for (let hideElement of hideElements) {
                    hideElement.classList.toggle('hide');
                }
                e.currentTarget.classList.toggle('hide');
            });
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
                    td.innerHTML += '\n';
                    break;
                case 'Email':
                    td.append(createContactIcon('./content/contacts/mail.svg', type, value));
                    td.innerHTML += '\n';
                    break;
                case 'Facebook':
                    td.append(createContactIcon('./content/contacts/fb.svg', type, value));
                    td.innerHTML += '\n';
                    break;
                case 'VK':
                    td.append(createContactIcon('./content/contacts/vk.svg', type, value));
                    td.innerHTML += '\n';
                    break;
                default :
                    td.append(createContactIcon('./content/contacts/default.svg', type, value));
                    td.innerHTML += '\n';
                break;
            }
        }
        let contactElements = td.querySelectorAll('img');
        if (contactElements.length > 4) {
            for (let i = 4; i < contactElements.length; i++) {
                contactElements[i].classList.toggle('hide');
            }
            td.append(createContactIcon(`./content/contacts/plus${contactElements.length - 4}.svg`, 'count'));
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
        for (const client of clients) {
            addClientToTable(client);
        }
    }

    async function getClients() {
        const responce = await fetch(`http://localhost:3000/api/clients`);
        return await responce.json();
    }
    
    async function initialization() {
        clientsTable = document.querySelector('#clientsTable');

        const clients = await getClients();
        if (clients.length !== 0) {
          fillClients(clients);          
        } else {
          //"Клиенты отсутствуют";
        }
    }

    document.addEventListener('DOMContentLoaded', initialization);
}());
