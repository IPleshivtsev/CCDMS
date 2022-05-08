(function script() {
    let plannedDeleteClientId = '';
    let filter = {
        searchString: '',
        column: 'id',
        sortType: 'asc'
    };
    let clientModel = {
        id: '',
        name: '',
        surname: '',
        lastName: '',
        contacts: []
    }
    let clients;
    let clientsTable;
    let tr;
    let td;
    let button;
    let img;
    let ths;
    let clientModalLabel;
    let secondName_clientModal;
    let firstName_clientModal;
    let patronymic_clientModal;
    let contactElementsBlock_clientModal;
    let contactElements_clientModal;
    let addContactButton
    let contactElement;
    let errorsBlock;
    let hasErrors = false;

    function removeValidateError(input) {
        if(input.classList.contains('not-validate'))
        {
            input.classList.toggle('not-validate');
        }
    }

    function addValidateError(errorMsg, errorInput) {
        errorsBlock.innerHTML += errorsBlock.innerHTML === '' || errorMsg === '' 
            ? errorMsg : '<br/>' + errorMsg;
        if(!errorInput.classList.contains('not-validate'))
        {
            errorInput.classList.toggle('not-validate');
        }
        hasErrors = true;
    }

    function validateContactElement(contactType, contactValue) {
        let result = true;
        switch (contactType) {
            case 'Телефон':
                result = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(contactValue);
                break;
            case 'Email':
                result = /^[\w]{1}[\w-\.]*@[\w-]+\.[a-z]{2,4}$/i.test(contactValue);
                break;
            case 'Facebook':
                result = /^(https?:\/\/)?((w{3}\.)?)facebook.com\/.*/i.test(contactValue);
                break;
            case 'VK':
                result = /^(https?:\/\/)?((w{3}\.)?)vk.com\/.*/i.test(contactValue);
                break;
            default:
                break;         
        }
        return result;
    }

    function validateClientModal() {
        hasErrors = false;
        errorsBlock.innerHTML = '';
        if (firstName_clientModal.value === '') {
            addValidateError('Поле "Имя" обязательно для заполнения', firstName_clientModal);
        } else if (firstName_clientModal.value.match(/\d/g) !== null) {
            addValidateError('В поле "Имя" не может быть чисел', firstName_clientModal);
        }
        
        if (secondName_clientModal.value === '') {
            addValidateError('Поле "Фамилия" обязательно для заполнения', secondName_clientModal);
        } else if (secondName_clientModal.value.match(/\d/g) !== null) {
            addValidateError('В поле "Фамилия" не может быть чисел', secondName_clientModal);
        }

        if (patronymic_clientModal.value.match(/\d/g) !== null) {
            addValidateError('В поле "Отчество" не может быть чисел', patronymic_clientModal);
        }

        let activeContactElements = contactElements_clientModal.filter(x => !x.classList.contains('hide'));        
        if (activeContactElements.length > 0) {      
            let isErrorMsgOfNullAdded = false;
            let isErrorMsgOfWrongPhoneAdded = false;
            let isErrorMsgOfWrongEmailAdded = false;
            let isErrorMsgOfWrongFacebookUrlAdded = false;
            let isErrorMsgOfWrongVKUrlAdded = false;

            let isError = false;
            let errorMsg = '';
            let activeContactElementType;
            let activeContactElementInput;
            let isContactElementValid;
                
            for (let activeContactElement of activeContactElements) {
                isError = false;
                errorMsg = '';
                activeContactElementType = activeContactElement.querySelector('span.contactType').innerText;
                activeContactElementInput = activeContactElement.querySelector('input');
                isContactElementValid = validateContactElement(activeContactElementType, activeContactElementInput.value);
                if (activeContactElementInput.value === '') {
                    isError = true;
                    if (!isErrorMsgOfNullAdded) {
                        errorMsg = 'Контакт не может быть пустым';
                        isErrorMsgOfNullAdded = true;
                    }                  
                } else if (activeContactElementType === 'Телефон' && !isContactElementValid) {
                    isError = true;
                    if (!isErrorMsgOfWrongPhoneAdded) {
                        errorMsg = 'Контакт с типом "Телефон" содержит некорректный номер телефона';
                        isErrorMsgOfWrongPhoneAdded = true;
                    }
                } else if (activeContactElementType === 'Email' && !isContactElementValid) {
                    isError = true;
                    if (!isErrorMsgOfWrongEmailAdded) {
                        errorMsg = 'Контакт с типом "Email" содержит некорректный адрес эл.почты';   
                        isErrorMsgOfWrongEmailAdded = true;         
                    }
                } else if (activeContactElementType === 'Facebook' && !isContactElementValid) {                    
                    isError = true;
                    if (!isErrorMsgOfWrongFacebookUrlAdded) {
                        errorMsg = 'Контакт с типом "Facebook" содержит некорректный адрес страницы';
                        isErrorMsgOfWrongFacebookUrlAdded = true;
                    }
                } else if (activeContactElementType === 'VK' && !isContactElementValid) {                    
                    isError = true;
                    if (!isErrorMsgOfWrongVKUrlAdded) {
                        errorMsg = 'Контакт с типом "VK" содержит некорректный адрес страницы';
                        isErrorMsgOfWrongVKUrlAdded = true;
                    }
                }
                
                if (isError) {
                    addValidateError(errorMsg, activeContactElementInput);
                }
            }
        }
    }

    async function checkAndSaveClient() {
        let modalFooter = document.querySelector('.modal-footer');
        validateClientModal();
        
        if (!hasErrors) {
            if (modalFooter.classList.contains('haveErrors')) {
                modalFooter.classList.toggle('haveErrors');
            }
            clientModel = {
                id: clientModalLabel.getAttribute('clientId'),
                name: firstName_clientModal.value,
                surname: secondName_clientModal.value,
                lastName: patronymic_clientModal.value,
                contacts: []
            }

            let contacts = contactElements_clientModal.filter(x => !x.classList.contains('hide'));

            for (let contact of contacts) {
                clientModel.contacts.push({
                    type: contact.querySelector('span.contactType').innerText,
                    value: contact.querySelector('input').value
                });
            }

            let resultData = await saveOrUpdateClient();
            if (resultData.isOkResult) {
                clients.push(resultData.result);
                fillClients(clients);
                document.querySelector('#clientModal').classList.toggle('show');
                document.querySelector('.modal-backdrop').classList.toggle('show');
                document.querySelector('#cancelButton').click();
            } else {
                //Вывести сообщение об ошибке
            }
        } else {            
            if (!modalFooter.classList.contains('haveErrors')) {
                modalFooter.classList.toggle('haveErrors');
            }
        }
    }

    function clearClientModal() {
        errorsBlock.innerHTML = '';
        removeValidateError(secondName_clientModal);
        removeValidateError(firstName_clientModal);
        removeValidateError(patronymic_clientModal);
        secondName_clientModal.value = '';
        firstName_clientModal.value = '';
        patronymic_clientModal.value = '';        

        let activeContactElements = contactElements_clientModal.filter(x => !x.classList.contains('hide'));

        for (let activeContactElement of activeContactElements) {
            activeContactElement.classList.toggle('hide');
            activeContactElement.querySelector('.contactType').innerText = 'Телефон';
            activeContactElement.querySelector('input').value = '';
            removeValidateError(activeContactElement.querySelector('input'));
        }
        checkAddContactBtn();
    }

    function checkAddContactBtn() {        
        if (contactElements_clientModal.filter(x => x.classList.contains('hide')).length === 0) {
            addContactButton.style.display = 'none';
        } else {
            addContactButton.style.display = 'inline-block';
        }
    }

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
        
        if (type === 'count') {
            img.addEventListener('click', function(e) {
                const hideElements = e.currentTarget.parentElement.querySelectorAll('img.hide');
                for (let hideElement of hideElements) {
                    hideElement.classList.toggle('hide');
                }
                e.currentTarget.parentElement.querySelector('#contactBlock_2').classList.toggle('hide');
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

    function createButtonWithImage(name, src, innerHTML, attributes) {
        button = document.createElement('button');
        button.name = name;
        for (const attribute of attributes) {
            button.setAttribute(attribute.name, attribute.value);
        }
        if (name === 'deleteClientButton') {
            button.addEventListener('click', function(e) {
                plannedDeleteClientId = e.currentTarget.closest('tr').querySelector('td[name="id"]').innerText;
            });
        } else if (name === 'editClientButton') {
            button.addEventListener('click', function(e) {
                let clientId = e.currentTarget.closest('tr').querySelector('td[name="id"]').innerText;
                clientModalLabel.innerHTML = `<b>Изменить данные </b><span>ID: ${clientId}</span>`;
                clientModalLabel.setAttribute('clientId', clientId);
                clearClientModal();
            })
        }
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
            for (let contactElement of contactElements) {
              contactBlock_1.append(contactElement);
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
            td.append(createButtonWithImage('editClientButton', './content/edit.svg', 'Изменить',
                [{name: 'data-bs-toggle', value: 'modal'}, {name: 'data-bs-target', value: '#clientModal'}]));
            td.append(createButtonWithImage('deleteClientButton', './content/cancel.svg', 'Удалить',
                [{name: 'data-bs-toggle', value: 'modal'}, {name: 'data-bs-target', value: '#deleteClientModal'}]));
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

    /* API */
    async function getClients() {
        const responce = await fetch(`http://localhost:3000/api/clients`);
        return await responce.json();
    }

    async function deleteClient(id) {
        const responce = await fetch(`http://localhost:3000/api/clients/${id}`, {
            method: 'DELETE',
        });
        return responce.ok;
        // Сделать обработку ответа
    }

    async function saveOrUpdateClient() {
        const responce = await fetch(`http://localhost:3000/api/clients`, {
            method: 'POST',
            body: JSON.stringify(clientModel)
        });

        if (responce.ok) {
            return { isOkResult: true, result: await responce.json() };
        } else {
            return { isOkResult: false, result: responce.status }
        }
    }
    /* */

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
        clientModalLabel = document.querySelector('#clientModalLabel');
        errorsBlock = document.querySelector('#errorsBlock');
                
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

        let dropdownItems = document.querySelectorAll('a.dropdown-item');

        for (let dropdownItem of dropdownItems) {
            dropdownItem.addEventListener('click', function(e) {
                let parentElement = e.currentTarget.closest('.contactElement');
                parentElement.querySelector('span.contactType').innerText = e.currentTarget.innerText;
            })
        }

        secondName_clientModal = document.querySelector('#secondName_clientModal');
        firstName_clientModal = document.querySelector('#firstName_clientModal');
        patronymic_clientModal = document.querySelector('#patronymic_clientModal');
        contactElementsBlock_clientModal = document.querySelector('#contactElementsBlock_clientModal');

        secondName_clientModal.addEventListener('input', function(e) {removeValidateError(e.currentTarget)});
        firstName_clientModal.addEventListener('input',  function(e) {removeValidateError(e.currentTarget)});
        patronymic_clientModal.addEventListener('input',  function(e) {removeValidateError(e.currentTarget)});
        contactElements_clientModal = Array.from(contactElementsBlock_clientModal.querySelectorAll('.contactElement'));
        
        for (let contactElement_clientModal of contactElements_clientModal) {
            contactElement_clientModal.querySelector('input').addEventListener('input',  function(e) {removeValidateError(e.currentTarget)});
        }

        document.querySelector('#addClientButton').addEventListener('click', function(e) {
            clientModalLabel.innerHTML = `<b>Добавить клиента</b>`;
            clientModalLabel.setAttribute('clientId', '');
            clearClientModal();
        });

        addContactButton = document.querySelector('#addContactButton');
        addContactButton.addEventListener('click', function(e) {
            contactElement = contactElements_clientModal.filter(x => x.classList.contains('hide'))[0];
            contactElement.classList.toggle('hide');
            contactElementsBlock_clientModal.appendChild(contactElement);
            checkAddContactBtn();
        });

        let deleteContactBtns = document.querySelectorAll('.deleteContactBtn');

        for (let deleteContactBtn of deleteContactBtns) {
            deleteContactBtn.addEventListener('click', function(e) {
                contactElement = e.currentTarget.parentElement;
                contactElement.classList.toggle('hide');
                contactElement.querySelector('.contactType').innerText = 'Телефон';
                contactElement.querySelector('input').value = '';
                checkAddContactBtn();               
            });
        }

        document.querySelector('#saveClientButton').addEventListener('click', checkAndSaveClient);

        let cancelModalBtns = document.querySelectorAll('#cancelButton');

        for (let cancelModalBtn of cancelModalBtns) {
            cancelModalBtn.addEventListener('click', function(e) {
                plannedDeleteClientId = '';
            });
        }

        document.querySelector('#deleteClientButton').addEventListener('click', async function (e) {
            if (plannedDeleteClientId !== '') {
                let ret = await deleteClient(plannedDeleteClientId);
                if (ret) {
                    clients = clients.filter( c => c.id !== plannedDeleteClientId );
                    fillClients(clients);
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initialization);
}());
