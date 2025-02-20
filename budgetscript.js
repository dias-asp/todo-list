// Переменные для хранения баланса, доходов и расходов
let balance = 0;

const balanceElement = document.getElementById('balance');
const incomeList = document.getElementById('income-list');
const expenseList = document.getElementById('expense-list');
const addButton = document.getElementById('add-btn');

const BASE_ID = 'appUfYNiRFYJShBvy';
const PERSONAL_ACCESS_TOKEN = 'patjQIbx6o2yZrYKY.36130faa2834465fd93912bdb1df8a7d609d2769ae224fc1f5ee52ef49d7d248';
const TABLE_NAME = 'budget';
// Функция для обновления баланса
function updateBalance(amount) {
    balance += amount;
    balanceElement.textContent = balance.toFixed(2);
}

// Функция для удаления элемента из Airtable
async function deleteFromAirtable(recordId, amount, listItem) {
    const apiUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
    const apiToken = `Bearer ${PERSONAL_ACCESS_TOKEN}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                Authorization: apiToken,
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка при удалении: ${response.statusText}`);
        }

        console.log('Запись успешно удалена из Airtable!');

        // Удаляем запись из DOM и обновляем баланс
        listItem.remove();
        updateBalance(-amount);
    } catch (error) {
        console.error('Ошибка при удалении записи из Airtable:', error);
    }
}

// Функция для добавления элемента в список
function addItem(name, amount, date, recordId = null) {
    const listItem = document.createElement('li');
    listItem.textContent = `${name} ${date[8] + date[9]}.${date[5] + date[6]}: ${amount}`;

    // Кнопка для удаления записи
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.style.marginLeft = '10px';
    deleteButton.style.background = '#f44336';
    deleteButton.style.color = '#fff';
    deleteButton.style.border = 'none';
    deleteButton.style.padding = '5px 10px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.borderRadius = '4px';

    deleteButton.addEventListener('click', () => {
        if (recordId) {
            deleteFromAirtable(recordId, amount, listItem);
        } else {
            listItem.remove();
            updateBalance(-amount); // Удаляем из интерфейса только, если запись не отправлена в Airtable
        }
    });

    listItem.appendChild(deleteButton);

    if (amount > 0) {
        incomeList.appendChild(listItem);
    } else {
        expenseList.appendChild(listItem);
    }

    updateBalance(amount);
}

// Функция для отправки данных в Airtable
async function saveToAirtable(name, amount) {
    const apiUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
    const apiToken = `Bearer ${PERSONAL_ACCESS_TOKEN}`;
    let utc = new Date().getTime();
    let date = new Date(utc + 5*3600000);
    date = date.toISOString().split('T')[0];

    const data = {
        fields: {
            name: name,
            date: date,
            amount: amount,
        },
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                Authorization: apiToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.statusText}`);
        }

        const record = await response.json();
        console.log('Успешно сохранено в Airtable!');

        // Добавляем запись в DOM с присвоенным record ID
        addItem(name, amount, date, record.id);
    } catch (error) {
        console.error('Ошибка при сохранении в Airtable:', error);
    }
}

// Функция для получения данных из Airtable
async function loadFromAirtable() {
    const apiUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
    const apiToken = `Bearer ${PERSONAL_ACCESS_TOKEN}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                Authorization: apiToken,
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.statusText}`);
        }

        const data = await response.json();
        data.records.sort((a, b) => a.fields.id - b.fields.id);
        data.records.forEach(record => {
            const { name, amount, date } = record.fields;
            addItem(name, amount, date, record.id); // Передаём ID записи
        });

        console.log('Данные успешно загружены из Airtable!');
    } catch (error) {
        console.error('Ошибка при загрузке данных из Airtable:', error);
    }
}

// Обработчик для кнопки добавления
addButton.addEventListener('click', () => {
    const nameInput = document.getElementById('name');
    const amountInput = document.getElementById('amount');

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!name || isNaN(amount)) {
        alert('Пожалуйста, заполните наименование и сумму!');
        return;
    }

    saveToAirtable(name, amount); // Сохраняем в Airtable и добавляем в список

    // Очищаем поля
    nameInput.value = '';
    amountInput.value = '';
});

// Загрузка данных при загрузке страницы
window.addEventListener('DOMContentLoaded', loadFromAirtable);