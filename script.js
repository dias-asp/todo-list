// Ваш Personal Access Token для Airtable
const PERSONAL_ACCESS_TOKEN = 'patjQIbx6o2yZrYKY.36130faa2834465fd93912bdb1df8a7d609d2769ae224fc1f5ee52ef49d7d248';
// Base ID вашей базы данных в Airtable
const BASE_ID = 'appUfYNiRFYJShBvy';
// Имя таблицы, из которой вы хотите получить данные
const LISTS = 'lists';
const TASKS = 'tasks';

// URL API Airtable
const LIST_URL = `https://api.airtable.com/v0/${BASE_ID}/${LISTS}`;
const TASK_URL = `https://api.airtable.com/v0/${BASE_ID}/${TASKS}`;

// Ссылка на список, куда будем добавлять пользователей
const listList = document.getElementById('listList');
let taskList;
// const taskList = document.getElementById('taskList');
const Lists = document.getElementById('Lists');
const Tasks = document.getElementById('Tasks');

let listID;
// Функция для получения данных из Airtable
async function fetchLists() {
    Lists.classList.remove('hidden');
    Tasks.classList.add('hidden');
    try {
        // Выполняем GET-запрос к Airtable API
        const response = await fetch(LIST_URL, {
            headers: {
                Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
            },
        });

        // Проверяем успешность запроса
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        // Преобразуем ответ в JSON
        const data = await response.json();

        // Очистим содержимое списка
        listList.innerHTML = '';

        data.records.sort((a, b) => a.fields.id - b.fields.id);

        // Добавляем каждую запись в виде элемента списка
        data.records.forEach((record) => {
            const li = document.createElement('li');
            li.textContent = `${record.fields.name}`;

            /*
            // Добавляем обработчик события для клика
            li.addEventListener('click', () => {
                console.log(`Нажат список: ${record.fields.name} (ID: ${record.fields.id})`);
                // Открываем задачи для конкретного списка
                fetchTasks(record.fields.id, record.fields.name);
            });*/

            // Создаем кнопку "Удалить"
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.style.marginLeft = '10px';

            // Добавляем обработчик события для удаления
            deleteButton.addEventListener('click', async () => {
                try {
                    const deleteResponse = await fetch(`${LIST_URL}/${record.id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                        },
                    });

                    if (!deleteResponse.ok) {
                        throw new Error(`Ошибка удаления: ${deleteResponse.status}`);
                    }

                    // Удаляем элемент из HTML
                    li.remove();
                    console.log(`Запись с ID ${record.id} удалена из Airtable`);
                } catch (error) {
                    console.error('Ошибка при удалении записи:', error);
                }
            });

            // Кнопка "Заглянуть в список"
            const viewButton = document.createElement('button');
            viewButton.textContent = 'Заглянуть в список';
            viewButton.style.marginLeft = '10px';

            // Добавляем обработчик события для кнопки
            viewButton.addEventListener('click', () => {
                console.log(`Заглядываем в список: ${record.fields.name} (ID: ${record.fields.id})`);
                fetchTasks(record.fields.id, record.fields.name); // Вызываем загрузку задач для конкретного списка
            });

            li.appendChild(viewButton); // Вставляем кнопку в элемент списка

            // Вставляем кнопку в элемент списка
            li.appendChild(deleteButton);

            // Добавляем элемент в список
            listList.appendChild(li);
        });
    } catch (error) {
        console.error('Ошибка при получении данных из Airtable:', error);
        listList.innerHTML = `<li>Не удалось загрузить данные. Проверьте консоль для подробностей.</li>`;
    }
}
async function fetchTasks(listID1, listName) {
    listID = listID1;
    Tasks.classList.remove('hidden');
    Lists.classList.add('hidden');
    Tasks.innerHTML = `
        <h1>${listName}</h1>
        <ul id="taskList"></ul>
        <div>
            <input id="newTaskInput" type="text" placeholder="Новая задача" />
            <button id="addTaskButton">Добавить</button>
        </div>
    `;

    taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    const addTaskForm = document.getElementById('addTaskForm');
    const newTaskName = document.getElementById('newTaskName');
    addTaskButton = document.getElementById('addTaskButton');
    AddTaskButton();
    newTaskInput = document.getElementById('newTaskInput');

    try {
        const response = await fetch(TASK_URL, {
            headers: {
                Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const data = await response.json();

        data.records.sort((a, b) => a.fields.id - b.fields.id);
        // Фильтруем задачи по ID списка
        const filteredTasks = data.records.filter(task => task.fields.list_id === listID);


        // Если задач нет
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li>Нет задач для этого списка</li>';
        } else {
            // Добавляем задачи в список
            filteredTasks.forEach(task => {

                console.log(task.fields.Status ? "YES" : "NO");
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.fields.Status;
                checkbox.addEventListener('change', async () => {
                    li.classList.toggle('done');
                    task.fields.Status = !task.fields.Status;
                    const updateData = {
                        fields: {
                            Status: task.fields.Status, // Send the updated status in the correct format
                        },
                    };
                    const updateResponse = await fetch(`${TASK_URL}/${task.id}`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updateData) //Don't forget to add body with request data
                    })

                    if (!updateResponse.ok)
                    {
                        throw new Error(`Ошибка выполнения задачи ${updateResponse.status}`);
                    }
                });

                const li = document.createElement('li');
                li.appendChild(checkbox);
                const span = document.createElement('span');
                span.textContent = task.fields.text;
                li.appendChild(span);

                // Добавляем кнопку "Удалить" для задачи
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Удалить';
                deleteButton.style.marginLeft = '10px';
                deleteButton.addEventListener('click', async () => {
                    try {
                        const deleteResponse = await fetch(`${TASK_URL}/${task.id}`, {
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                            },
                        });

                        if (!deleteResponse.ok) {
                            throw new Error(`Ошибка удаления задачи: ${deleteResponse.status}`);
                        }

                        // Удаляем задачу из HTML
                        li.remove();
                        console.log(`Задача с ID ${task.id} успешно удалена`);
                    } catch (error) {
                        console.error('Ошибка при удалении задачи:', error);
                    }
                });
                li.appendChild(deleteButton);

                if (task.fields.Status === true) {
                    li.classList.add('done');
                }
                li.addEventListener('click', () => {

                })
                taskList.appendChild(li);
            });
        }
/*
        // Добавление новой задачи
        addTaskForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const taskName = newTaskName.value.trim();
            if (!taskName) return;

            try {
                const createResponse = await fetch(TASK_URL, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fields: {
                            name: taskName,
                            list: listID, // Привязка задачи к текущему списку
                        },
                    }),
                });

                if (!createResponse.ok) {
                    throw new Error(`Ошибка при добавлении задачи: ${createResponse.status}`);
                }

                const newTask = await createResponse.json();

                // Добавляем новую задачу в список задач (на странице)
                const li = document.createElement('li');
                li.textContent = newTask.fields.name;

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Удалить';
                deleteButton.style.marginLeft = '10px';
                deleteButton.addEventListener('click', async () => {
                    try {
                        const deleteResponse = await fetch(`${TASK_URL}/${newTask.id}`, {
                            method: 'DELETE',
                            headers: {
                                Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                            },
                        });

                        if (!deleteResponse.ok) {
                            throw new Error(`Ошибка удаления задачи: ${deleteResponse.status}`);
                        }

                        li.remove();
                        console.log(`Задача с ID ${newTask.id} успешно удалена`);
                    } catch (error) {
                        console.error('Ошибка при удалении задачи:', error);
                    }
                });

                li.appendChild(deleteButton);
                taskList.appendChild(li);

                // Очищаем поле ввода
                newTaskName.value = '';
            } catch (error) {
                console.error('Ошибка при добавлении задачи:', error);
            }
        });*/
    } catch (error) {
        console.error('Ошибка при получении задач:', error);
        Tasks.innerHTML = `<h1>${listName}</h1><p>Не удалось загрузить задачи</p>`;
    }
}

let newTaskInput = document.getElementById('newTaskInput');
let addTaskButton = document.getElementById('addTaskButton');


function AddTaskButton() {


// Обработчик для кнопки "Добавить"
    addTaskButton.addEventListener('click', async () => {
        // Читаем значение из поля ввода
        const newTaskName = newTaskInput.value.trim();

        // Проверяем, введено ли имя
        if (!newTaskName) {
            alert('Введите название новой задачи!');
            return;
        }
        try {
            // Выполняем POST-запрос для добавления записи в Airtable
            const response = await fetch(TASK_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fields: {
                        text: newTaskName, // Поле "name" (или замените на нужное поле таблицы)
                        list_id: listID,
                        Status: false,
                    },
                }),
            });

            // Проверяем успешность запроса
            if (!response.ok) {
                throw new Error(`Ошибка при добавлении записи: ${response.status}`);
            }

            // Преобразуем ответ в JSON
            const newRecord = await response.json();

            // Добавляем новую запись в DOM вручную
            const li = document.createElement('li');

            // Создаем кнопку "Удалить" для новой записи
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.style.marginLeft = '10px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = false;
            checkbox.addEventListener('change', async () => {
                li.classList.toggle('done');
                newRecord.fields.Status = !newRecord.fields.Status;
                const updateData = {
                    fields: {
                        Status: newRecord.fields.Status, // Send the updated status in the correct format
                    },
                };
                const updateResponse = await fetch(`${TASK_URL}/${newRecord.id}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData) //Don't forget to add body with request data
                })

                if (!updateResponse.ok)
                {
                    throw new Error(`Ошибка выполнения задачи ${updateResponse.status}`);
                }
            });
            li.appendChild(checkbox);

            const span = document.createElement('span');
            span.textContent = newRecord.fields.text;
            li.appendChild(span);

            // Добавляем обработчик для удаления
            deleteButton.addEventListener('click', async () => {
                try {
                    const deleteResponse = await fetch(`${TASK_URL}/${newRecord.id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                        },
                    });

                    if (!deleteResponse.ok) {
                        throw new Error(`Ошибка удаления: ${deleteResponse.status}`);
                    }

                    // Удаляем элемент из DOM
                    li.remove();
                    console.log(`Запись с ID ${newRecord.id} удалена из Airtable`);
                } catch (error) {
                    console.error('Ошибка при удалении записи:', error);
                }
            });

            // Присоединяем кнопку к элементу списка
            li.appendChild(deleteButton);

            // Добавляем новый элемент в список
            taskList.appendChild(li);

            // Очищаем поле ввода
            newTaskInput.value = '';
        } catch (error) {
            console.error('Ошибка при добавлении нового задачи:', error);
            alert('Не удалось добавить новый Задачу. Проверьте консоль для подробностей.');
        }
    });
}


// Селекторы для новых элементов
const newListInput = document.getElementById('newListInput');
const addListButton = document.getElementById('addListButton');

// Обработчик для кнопки "Добавить"
addListButton.addEventListener('click', async () => {
    // Читаем значение из поля ввода
    const newListName = newListInput.value.trim();

    // Проверяем, введено ли имя
    if (!newListName) {
        alert('Введите название нового списка!');
        return;
    }

    try {
        // Выполняем POST-запрос для добавления записи в Airtable
        const response = await fetch(LIST_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    name: newListName, // Поле "name" (или замените на нужное поле таблицы)
                },
            }),
        });

        // Проверяем успешность запроса
        if (!response.ok) {
            throw new Error(`Ошибка при добавлении записи: ${response.status}`);
        }

        // Преобразуем ответ в JSON
        const newRecord = await response.json();

        // Добавляем новую запись в DOM вручную
        const li = document.createElement('li');
        li.textContent = `${newRecord.fields.id}: ${newRecord.fields.name}`;

        // Создаем кнопку "Удалить" для новой записи
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.style.marginLeft = '10px';

        // Добавляем обработчик для удаления
        deleteButton.addEventListener('click', async () => {
            try {
                const deleteResponse = await fetch(`${LIST_URL}/${newRecord.id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${PERSONAL_ACCESS_TOKEN}`,
                    },
                });

                if (!deleteResponse.ok) {
                    throw new Error(`Ошибка удаления: ${deleteResponse.status}`);
                }

                // Удаляем элемент из DOM
                li.remove();
                console.log(`Запись с ID ${newRecord.id} удалена из Airtable`);
            } catch (error) {
                console.error('Ошибка при удалении записи:', error);
            }
        });

        // Кнопка "Заглянуть в список"
        const viewButton = document.createElement('button');
        viewButton.textContent = 'Заглянуть в список';
        viewButton.style.marginLeft = '10px';

        // Добавляем обработчик события для кнопки
        viewButton.addEventListener('click', () => {
            console.log(`Заглядываем в список: ${newRecord.fields.name} (ID: ${newRecord.fields.id})`);
            fetchTasks(newRecord.fields.id, newRecord.fields.name); // Вызываем загрузку задач для конкретного списка
        });

        li.appendChild(viewButton); // Вставляем кнопку в элемент списка

        // Присоединяем кнопку к элементу списка
        li.appendChild(deleteButton);

        // Добавляем новый элемент в список
        listList.appendChild(li);

        // Очищаем поле ввода
        newListInput.value = '';
    } catch (error) {
        console.error('Ошибка при добавлении нового списка:', error);
        alert('Не удалось добавить новый список. Проверьте консоль для подробностей.');
    }
});


// Вызов функции для получения данных
fetchLists();