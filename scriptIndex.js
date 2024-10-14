(function script() {
  const filter = {
    searchString: '',
    column: 'id',
    sortType: 'asc',
  };
  let clientModel = {
    id: '',
    name: '',
    surname: '',
    lastName: '',
    contacts: [],
  };
  let timerId;
  let plannedDeleteClientId = '';  
  let clients;
  let clientsTable;
  let td;
  let clientModalLabel;
  let secondNameClientModal;
  let firstNameClientModal;
  let patronymicClientModal;
  let contactElementsBlockClientModal;
  let contactElementsClientModal;
  let addContactButton;
  let errorsBlock;
  let clientModalCancelButton;
  let deleteClientModalCancelButton;
  let deleteClientFromModalButton;
  let modalDeleteClientFooter;
  let hasErrors = false;

  /* Функции обращения к методам API */
  // Тексты ошибок при обращении к методам API
  const unknownErrorMsg = 'Что-то пошло не так...';
  const invalidArgumentDataErrorMsg = 'Некорректные данные в аргументе';
  const clientNotFoundErrorMsg = 'Клиент с таким ID не найден';

  // Получение клиентов
  async function getClientsAPI() {
    try {
      const responce = await fetch('http://localhost:3000/api/clients');
      return await responce.json();
    } catch (exp) {
      return exp;
    }
  }

  // Удаление клиента по Id
  async function deleteClientAPI(id) {
    try {
      const responce = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (responce.ok) {
        return { isOkResult: true, result: '' };
      }

      return { isOkResult: false, result: unknownErrorMsg };
    } catch (exp) {
      return { isOkResult: false, result: unknownErrorMsg };
    }
  }

  // Сохранение/обновление клиента
  async function saveOrUpdateClientAPI() {
    try {
      let responce;
      if (clientModel.id !== '') {
        responce = await fetch(`http://localhost:3000/api/clients/${clientModel.id}`, {
          method: 'PATCH',
          body: JSON.stringify(clientModel),
        });
      } else {
        responce = await fetch('http://localhost:3000/api/clients', {
          method: 'POST',
          body: JSON.stringify(clientModel),
        });
      }

      if (responce.ok) {
        return { isOkResult: true, result: await responce.json() };
      }

      let errorMsg;

      if (responce.status === 422) {
        errorMsg = invalidArgumentDataErrorMsg;
      } else if (responce.status === 404 && responce.statusText !== 'Not Found') {
        errorMsg = clientNotFoundErrorMsg;
      } else {
        errorMsg = unknownErrorMsg;
      }

      return { isOkResult: false, result: errorMsg };
    } catch (exp) {
      return { isOkResult: false, result: unknownErrorMsg };
    }
  }
  /* */

  /* Общие функции страницы */
  // Активация/деактивация индикатора загрузки
  function switchSpinner(spinner, isSwitchOn) {
    document.querySelector('#spinnerTableBlock').style.height = `${clientsTable.clientHeight - 24}px`;
    if ((isSwitchOn && spinner.classList.contains('hide'))
         || (!isSwitchOn && !spinner.classList.contains('hide'))) {
      spinner.classList.toggle('hide');
    }
  }
  /* */

  /* Функции таблицы */
  // Создание элемента с иконкой конкретного контакта
  function createContactIcon(src, type, value = '') {
    const img = document.createElement('img');
    img.src = src;

    if (type === 'count') {
      img.addEventListener('click', (e) => {
        e.currentTarget.parentElement.querySelectorAll('img.hide').forEach((hideElement) => {
          hideElement.classList.toggle('hide');
        });
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

  // Создание кнопки с изображением
  function createButtonWithImage(name, src, innerHTML, attributes) {
    const button = document.createElement('button');
    button.name = name;

    attributes.forEach((attribute) => {
      button.setAttribute(attribute.name, attribute.value);
    });

    if (name === 'deleteClientButton') {
      button.addEventListener('click', (e) => {
        plannedDeleteClientId = e.currentTarget.closest('tr').querySelector('td[name="id"]').innerText;
        document.querySelector('#errorDeleteBlock').innerHTML = '';
        
        if (modalDeleteClientFooter.classList.contains('haveErrors')) {
          modalDeleteClientFooter.classList.toggle('haveErrors');
        }
      });
    } else if (name === 'editClientButton') {
      button.addEventListener('click', (e) => {
        openClientModalOnEdit(e.currentTarget.closest('tr'));
      });
    }

    const img = document.createElement('img');
    img.src = src;
    button.append(img);
    button.innerHTML += innerHTML;
    return button;
  }

  // Заполнение контактов клиента в ячейку таблицы
  function fillContacts(tdElem, contacts) {
    contacts.forEach(({ type, value }) => {
      switch (type) {
        case 'Телефон':
          tdElem.append(createContactIcon('./content/contacts/phone.svg', type, value));
          break;
        case 'Email':
          tdElem.append(createContactIcon('./content/contacts/mail.svg', type, value));
          break;
        case 'Facebook':
          tdElem.append(createContactIcon('./content/contacts/fb.svg', type, value));
          break;
        case 'VK':
          tdElem.append(createContactIcon('./content/contacts/vk.svg', type, value));
          break;
        default:
          tdElem.append(createContactIcon('./content/contacts/default.svg', type, value));
          break;
      }
    });

    const contactElements = tdElem.querySelectorAll('img');
    const contactBlock1 = document.createElement('div');
    contactBlock1.id = 'contactBlock_1';
    contactBlock1.style.display = 'inline';

    if (contactElements.length > 4) {
      const contactBlock2 = document.createElement('div');
      contactBlock2.id = 'contactBlock_2';
      contactBlock2.classList.toggle('hide');

      contactElements.forEach((contactElem, index) => {
        if (index === 4) {
          contactElem.classList.toggle('hide');
        }
        if (index <= 4) {
          contactBlock1.append(contactElem);
          contactBlock1.innerHTML += '\n';
        }
        if (index > 4) {
          contactBlock2.append(contactElem);
          contactBlock2.innerHTML += '\n';
        }
      });

      tdElem.append(contactBlock1, createContactIcon(`./content/contacts/plus${contactElements.length - 4}.svg`, 'count'), contactBlock2);
    } else {
      contactElements.forEach((contactElem) => {
        contactBlock1.append(contactElem);
        contactBlock1.innerHTML += '\n';
      });

      tdElem.append(contactBlock1);
    }
    return tdElem;
  }

  // Создание ячейки таблицы
  function createTd(name, innerHTML, contacts = null) {
    td = document.createElement('td');
    td.setAttribute('name', name);

    if (name === 'actions') {
      td.append(createButtonWithImage('editClientButton', './content/edit.svg', 'Изменить',
        [{ name: 'data-bs-toggle', value: 'modal' }, { name: 'data-bs-target', value: '#clientModal' }]));
      td.append(createButtonWithImage('deleteClientButton', './content/cancel.svg', 'Удалить',
        [{ name: 'data-bs-toggle', value: 'modal' }, { name: 'data-bs-target', value: '#deleteClientModal' }]));
    } else if (name === 'contacts') {
      td = fillContacts(td, contacts);
    } else {
      td.innerHTML = innerHTML;
    }
    return td;
  }

  // Добавление клиента в таблицу
  function addClientToTable(client) {
    const tr = document.createElement('tr');
    tr.append(createTd('id', client.id));
    tr.append(createTd('fio', `${client.surname} ${client.name} ${client.lastName}`));
    tr.append(createTd('createdDatetime', `${new Date(client.createdAt).toLocaleDateString()} <p>${new Date(client.createdAt).toLocaleTimeString([], { timeStyle: 'short' })}</p>`));
    tr.append(createTd('changedDatetime', `${new Date(client.updatedAt).toLocaleDateString()} <p>${new Date(client.updatedAt).toLocaleTimeString([], { timeStyle: 'short' })}</p>`));
    tr.append(createTd('contacts', '', client.contacts));
    tr.append(createTd('actions', ''));
    tr.append(td);
    clientsTable.querySelector('tBody').append(tr);
  }

  // Инициализация всплывающих подсказок контактов клиента
  function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  // Заполнение таблицы клиентами
  function fillClients(clientsArr) {
    switchSpinner(document.querySelector('#spinnerTableBlock'), true);
    clientsTable.querySelector('tBody').innerHTML = '';
    clientsArr.forEach((client) => {
      addClientToTable(client);
    });
    initializeTooltips();
    switchSpinner(document.querySelector('#spinnerTableBlock'), false);
  }

  // Инициализация сортировки таблицы
  function initializeSort() {
    const ths = document.querySelectorAll('th[isSort="true"');
    ths.forEach((th) => {
      th.addEventListener('click', (e) => {

        let sortType;
        const imgEl = e.currentTarget.querySelectorAll('img');

        if (imgEl.length > 1) {
          if (e.currentTarget.querySelector('img.sortFio') === null) {
            sortType = '';
          } else if (e.currentTarget.querySelector('img.sortFio').name === 'sortFioAsc') {
            sortType = 'sortDesc';
          } else {
            sortType = 'sortAsc';
          }
        } else {
          sortType = imgEl[0].className;
        }

        ths.forEach((thElem) => {
          thElem.className = '';
          thElem.querySelectorAll('img').forEach((imgElem) => {
            imgElem.className = 'sortHide';
          });
        });

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
    });
  }

  // Применение фильтра
  function applyFilter() {
    const isAsc = filter.sortType === 'asc';

    switch (filter.column) {
      case 'id':
      case 'createdDatetime':
      case 'changedDatetime':
        clients.sort((a, b) => {
          const aValue = filter.column === 'id' ? a.id
            : new Date(filter.column === 'createdAt'
              ? a.createdAt : a.updatedAt);
          const bValue = filter.column === 'id' ? b.id
            : new Date(filter.column === 'createdAt'
              ? b.createdAt : b.updatedAt);
          return isAsc ? bValue - aValue
            : aValue - bValue;
        });
        break;
      case 'fio':
        clients.sort((a, b) => {
          const nameA = `${a.surname} ${a.name} ${a.lastName}`.toLowerCase();
          const nameB = `${b.surname} ${b.name} ${b.lastName}`.toLowerCase();
          if (nameA < nameB) {
            return isAsc ? -1 : 1;
          }
          if (nameA > nameB) {
            return isAsc ? 1 : -1;
          }
          return 0;
        });
        break;
      default:
        break;
    }
    const filteredClients = clients.filter((item) => item.id.indexOf(filter.searchString) !== -1
            || `${item.surname} ${item.name} ${item.lastName}`.toLowerCase().indexOf(filter.searchString) !== -1
            || new Date(item.createdAt).toLocaleString().replaceAll(',', '').indexOf(filter.searchString) !== -1
            || new Date(item.updatedAt).toLocaleString().replaceAll(',', '').indexOf(filter.searchString) !== -1);
    fillClients(filteredClients);
  }

  // Поиск по значению поисковой строки
  function searchClient() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      filter.searchString = document.querySelector('#searchInput').value.toLowerCase();
      applyFilter();
    }, 300);
  }
  /* */

  /* Функции модальных окон */
  // Очистка модального окна добавления/редактирования клиента
  function clearClientModal() {
    errorsBlock.innerHTML = '';
    removeValidateError(secondNameClientModal);
    removeValidateError(firstNameClientModal);
    removeValidateError(patronymicClientModal);
    secondNameClientModal.value = '';
    firstNameClientModal.value = '';
    patronymicClientModal.value = '';

    if (!deleteClientFromModalButton.classList.contains('hide')) {
      deleteClientFromModalButton.classList.toggle('hide');
    }

    if (clientModalCancelButton.classList.toggle('hide')) {
      clientModalCancelButton.classList.toggle('hide');
    }

    contactElementsClientModal.filter((x) => !x.classList.contains('hide')).forEach((activeContactElement) => {
      activeContactElement.classList.toggle('hide');
      activeContactElement.querySelector('.contactType').innerText = 'Телефон';
      activeContactElement.querySelector('input').value = '';
      removeValidateError(activeContactElement.querySelector('input'));
    });

    checkAddContactBtn();
  }

  // Открытие модального окна добавления/редактирования клиента в режиме редактирования
  function openClientModalOnEdit(currentClient) {
    clearClientModal();
    const currentClientModel = clients.filter((x) => x.id === currentClient.querySelector('td[name="id"]').innerText)[0];
    clientModalLabel.innerHTML = `<b>Изменить данные </b><span>ID: ${currentClientModel.id}</span>`;
    clientModalLabel.setAttribute('clientId', currentClientModel.id);
    deleteClientFromModalButton.classList.toggle('hide');
    clientModalCancelButton.classList.toggle('hide');

    secondNameClientModal.value = currentClientModel.surname;
    firstNameClientModal.value = currentClientModel.name;
    patronymicClientModal.value = currentClientModel.lastName;

    currentClientModel.contacts.forEach((clientContact) => {
      addClientContact(clientContact.type, clientContact.value);
    });
  }

  // Проверка на отображения кнопки "Добавить контакт"
  // в зависимости от количества контактов на форме
  function checkAddContactBtn() {
    if (contactElementsClientModal.filter((x) => x.classList.contains('hide')).length === 0) {
      addContactButton.style.display = 'none';
    } else {
      addContactButton.style.display = 'inline-block';
    }
  }

  // Удаление контакта клиента из блока "Контакты" модального окна добавления/редактирования клиента
  function deleteClientContact(contactElem) {
    contactElem.classList.toggle('hide');
    contactElem.querySelector('.contactType').innerText = 'Телефон';
    contactElem.querySelector('input').value = '';
    checkAddContactBtn();
  }

  // Присвоение переменной plannedDeleteClientId значения Id клиента, которого планируется удалить.
  function setPlannedDeleteClientId(value) {
    plannedDeleteClientId = value;
  }

  // Сравнение контактов отредактированного клиента с контактами сохраненного клиента
  function compareContacts(newContacts, oldContacts) {
    if (newContacts.length !== oldContacts.length) {
      return false;
    }

    for (let i = 0; i < newContacts.length; i++) {
      if (newContacts[i].type !== oldContacts[i].type
            || newContacts[i].value !== oldContacts[i].value) {
        return false;
      }
    }
    return true;
  }

  // Сравнение отредактированного клиента с сохраненным клиентом
  function compareClientModelWithSaved(newModel) {
    const savedModel = clients.filter((x) => x.id === newModel.id)[0];

    if (newModel.name !== savedModel.name
            || newModel.surname !== savedModel.surname
            || newModel.lastName !== savedModel.lastName
            || !compareContacts(newModel.contacts, savedModel.contacts)) {
      return false;
    }
    return true;
  }

  // Добавление контакта в блок "Контакты" модального окна добавления/редактирования клиента
  function addClientContact(contactType = 'Телефон', contactValue = '') {
    const contactElement = contactElementsClientModal.filter((x) => x.classList.contains('hide'))[0];
    contactElement.querySelector('.contactType').innerText = contactType;
    contactElement.querySelector('input').value = contactValue;
    contactElement.classList.toggle('hide');
    contactElementsBlockClientModal.appendChild(contactElement);
    checkAddContactBtn();
  }

  // Удаление признака ошибки с поля для ввода
  function removeValidateError(input) {
    if (input.classList.contains('not-validate')) {
      input.classList.toggle('not-validate');
    }
  }

  // Добавление признака ошибки на поле для ввода и в блок с ошибками
  function addValidateError(errorMsg, errorInput) {
    errorsBlock.innerHTML += errorsBlock.innerHTML === '' || errorMsg === ''
      ? errorMsg : `<br/>${errorMsg}`;

    if (!errorInput.classList.contains('not-validate')) {
      errorInput.classList.toggle('not-validate');
    }

    hasErrors = true;
  }

  // Валидация значения контакта согласно его типу
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

  // Валидация модального окна добавления/редактирования клиента
  function validateClientModal() {
    hasErrors = false;
    errorsBlock.innerHTML = '';

    if (secondNameClientModal.value === '') {
      addValidateError('Поле "Фамилия" обязательно для заполнения', secondNameClientModal);
    } else if (secondNameClientModal.value.match(/\d/g) !== null) {
      addValidateError('В поле "Фамилия" не может быть чисел', secondNameClientModal);
    }

    if (firstNameClientModal.value === '') {
      addValidateError('Поле "Имя" обязательно для заполнения', firstNameClientModal);
    } else if (firstNameClientModal.value.match(/\d/g) !== null) {
      addValidateError('В поле "Имя" не может быть чисел', firstNameClientModal);
    }

    if (patronymicClientModal.value.match(/\d/g) !== null) {
      addValidateError('В поле "Отчество" не может быть чисел', patronymicClientModal);
    }

    const activeContactElements = contactElementsClientModal.filter((x) => !x.classList.contains('hide'));
    
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

      activeContactElements.forEach((activeContactElement) => {
        isError = false;
        errorMsg = '';
        activeContactElementType = activeContactElement.querySelector('span.contactType').innerText;
        activeContactElementInput = activeContactElement.querySelector('input');
        isContactElementValid = validateContactElement(
          activeContactElementType,
          activeContactElementInput.value,
        );

        if (activeContactElementInput.value === '') {
          isError = true;

          if (!isErrorMsgOfNullAdded) {
            errorMsg = 'Контакт не может быть пустым';
            isErrorMsgOfNullAdded = true;
          }
        } else if (activeContactElementType === 'Телефон' && !isContactElementValid) {
          isError = true;

          if (!isErrorMsgOfWrongPhoneAdded) {
            errorMsg = 'Контакт "Телефон" содержит некорректный номер';
            isErrorMsgOfWrongPhoneAdded = true;
          }
        } else if (activeContactElementType === 'Email' && !isContactElementValid) {
          isError = true;
          
          if (!isErrorMsgOfWrongEmailAdded) {
            errorMsg = 'Контакт "Email" содержит некорректный адрес';
            isErrorMsgOfWrongEmailAdded = true;
          }
        } else if (activeContactElementType === 'Facebook' && !isContactElementValid) {
          isError = true;
          
          if (!isErrorMsgOfWrongFacebookUrlAdded) {
            errorMsg = 'Контакт "Facebook" содержит некорректный адрес страницы';
            isErrorMsgOfWrongFacebookUrlAdded = true;
          }
        } else if (activeContactElementType === 'VK' && !isContactElementValid) {
          isError = true;

          if (!isErrorMsgOfWrongVKUrlAdded) {
            errorMsg = 'Контакт "VK" содержит некорректный адрес страницы';
            isErrorMsgOfWrongVKUrlAdded = true;
          }
        }

        if (isError) {
          addValidateError(errorMsg, activeContactElementInput);
        }
      });
    }
  }

  // Сохранение нового/отредактированного клиента
  async function checkAndSaveClient() {
    switchSpinner(document.querySelector('#spinnerClientModalBlock'), true);
    const modalFooter = document.querySelector('#clientModal .modal-footer');
    validateClientModal();

    if (!hasErrors) {
      if (modalFooter.classList.contains('haveErrors')) {
        modalFooter.classList.toggle('haveErrors');
      }

      clientModel = {
        id: clientModalLabel.getAttribute('clientId'),
        name: firstNameClientModal.value,
        surname: secondNameClientModal.value,
        lastName: patronymicClientModal.value,
        contacts: [],
      };

      contactElementsClientModal.filter((x) => !x.classList.contains('hide')).forEach((contact) => {
        clientModel.contacts.push({
          type: contact.querySelector('span.contactType').innerText,
          value: contact.querySelector('input').value,
        });
      });

      let resultData;

      if (clientModel.id === '' || (clientModel.id !== '' && !compareClientModelWithSaved(clientModel))) {
        resultData = await saveOrUpdateClientAPI();
      } else {
        clientModalCancelButton.click();
      }

      if (resultData !== null) {
        if (resultData.isOkResult) {
          clients = clients.filter((x) => x.id !== resultData.result.id);
          clients.push(resultData.result);
          fillClients(clients);
          clientModalCancelButton.click();
        } else {
          errorsBlock.innerHTML = resultData.result;
          if (!modalFooter.classList.contains('haveErrors')) {
            modalFooter.classList.toggle('haveErrors');
          }
        }
      }
    } else if (!modalFooter.classList.contains('haveErrors')) {
      modalFooter.classList.toggle('haveErrors');
    }
    switchSpinner(document.querySelector('#spinnerClientModalBlock'), false);
  }

  // Удаление клиента
  async function deleteClient() {
    if (plannedDeleteClientId !== '') {
      const resultData = await deleteClientAPI(plannedDeleteClientId);

      if (resultData.isOkResult) {
        if (modalDeleteClientFooter.classList.contains('haveErrors')) {
          modalDeleteClientFooter.classList.toggle('haveErrors');
        }

        clients = clients.filter((c) => c.id !== plannedDeleteClientId);
        fillClients(clients);
        deleteClientModalCancelButton.click();
      } else {
        document.querySelector('#errorDeleteBlock').innerHTML = resultData.result;

        if (!modalDeleteClientFooter.classList.contains('haveErrors')) {
          modalDeleteClientFooter.classList.toggle('haveErrors');
        }
      }
    }
  }
  /* */

  // Первичная инициализация страницы
  async function initialization() {
    clientsTable = document.querySelector('#clientsTable');
    clientModalLabel = document.querySelector('#clientModalLabel');
    errorsBlock = document.querySelector('#errorsBlock');
    modalDeleteClientFooter = document.querySelector('#deleteClientModal .modal-footer');
    secondNameClientModal = document.querySelector('#secondNameClientModal');
    firstNameClientModal = document.querySelector('#firstNameClientModal');
    patronymicClientModal = document.querySelector('#patronymicClientModal');
    contactElementsBlockClientModal = document.querySelector('#contactElementsBlockClientModal');
    contactElementsClientModal = Array.from(contactElementsBlockClientModal.querySelectorAll('.contactElement'));
    addContactButton = document.querySelector('#addContactButton');
    clientModalCancelButton = document.querySelector('#clientModal #cancelButton');
    deleteClientModalCancelButton = document.querySelector('#deleteClientModal #cancelButton');
    deleteClientFromModalButton = document.querySelector('#deleteClientFromModalButton');

    clients = await getClientsAPI();
    if (clients.length > 0) {
      fillClients(clients);
    } else {
      document.querySelector('#errorGridBlock').innerHTML = 'Клиенты отсутствуют';
    }
    initializeSort();

    document.querySelector('#addClientButton').addEventListener('click', () => {
      clientModalLabel.innerHTML = '<b>Добавить клиента</b>';
      clientModalLabel.setAttribute('clientId', '');
      clearClientModal();
    });

    document.querySelector('#searchInput').addEventListener('input', searchClient);

    document.querySelectorAll('a.dropdown-item').forEach((dropdownItem) => {
      dropdownItem.addEventListener('click', (e) => {
        const parentElement = e.currentTarget.closest('.contactElement');
        parentElement.querySelector('span.contactType').innerText = e.currentTarget.innerText;
      });
    });

    secondNameClientModal.addEventListener('input', (e) => { removeValidateError(e.currentTarget); });
    firstNameClientModal.addEventListener('input', (e) => { removeValidateError(e.currentTarget); });
    patronymicClientModal.addEventListener('input', (e) => { removeValidateError(e.currentTarget); });
    
    contactElementsClientModal.forEach((contactElementClientModal) => {
      contactElementClientModal.querySelector('input').addEventListener('input', (e) => { removeValidateError(e.currentTarget); });
    });

    addContactButton.addEventListener('click', () => { addClientContact(); });
    
    document.querySelectorAll('.deleteContactBtn').forEach((deleteContactBtn) => {
      deleteContactBtn.addEventListener('click', (e) => {
        deleteClientContact(e.currentTarget.parentElement);
      });
    });

    document.querySelector('#saveClientButton').addEventListener('click', checkAndSaveClient);
    document.querySelector('#deleteClientButton').addEventListener('click', deleteClient);
    clientModalCancelButton.addEventListener('click', () => { setPlannedDeleteClientId(''); });
    deleteClientModalCancelButton.addEventListener('click', () => { setPlannedDeleteClientId(''); });
    deleteClientFromModalButton.addEventListener('click', () => { setPlannedDeleteClientId(clientModalLabel.getAttribute('clientId')); });
  }

  document.addEventListener('DOMContentLoaded', initialization);
}());
