document.addEventListener('DOMContentLoaded', function () {
    const todoForm = document.getElementById('todo-form');
    const addBtn = document.getElementById('add-btn');
    const todoInput = document.getElementById('sample3');
    const todoList = document.getElementById('todo-list');



    function createTodoItem(todoText, day, priority) {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');

        if (priority === 'high') {
            todoItem.classList.add('priority-high');
        } else if (priority === 'medium') {
            todoItem.classList.add('priority-medium');
        } else if (priority === 'low') {
            todoItem.classList.add('priority-low');
        }

        const addSound = new Audio('sounds/add.wav');
        addSound.play();


        const todoContent = document.createElement('span');
        todoContent.textContent = todoText;

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('todo-buttons');

        const statusBtn = document.createElement('button');
        statusBtn.classList.add('status-btn');
        statusBtn.innerHTML = '<img src="img/unchecked.png" alt="unchecked">';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<img src="img/delete.png" alt="delete">';

        deleteBtn.addEventListener('click', () => {

            const deleteSound = new Audio('sounds/delete.wav');
            deleteSound.play();

            todoItem.remove();
            saveTodos();
        });

        statusBtn.addEventListener('click', function () {

            const checkSound = new Audio('sounds/check.wav');
            checkSound.play();

            statusBtn.innerHTML = '<img src="img/checked.png" alt="checked">';

            setTimeout(() => {
                todoItem.remove();
                saveTodos();
            }, 350);
        });

        buttonContainer.appendChild(statusBtn);
        buttonContainer.appendChild(deleteBtn);

        todoItem.appendChild(todoContent);
        todoItem.appendChild(buttonContainer);

        document.querySelector(`.calendar-box:nth-child(${day + 4})`).appendChild(todoItem);
        saveTodos();
    }

    function saveTodos() {
        const todos = [];
        document.querySelectorAll('.calendar-box').forEach((box, index) => {
            const dayTodos = [];
            box.querySelectorAll('.todo-item').forEach(todo => {
                const todoText = todo.querySelector('span').textContent;
                const priorityClass = todo.classList.contains('priority-high') ? 'high' :
                    todo.classList.contains('priority-medium') ? 'medium' :
                        todo.classList.contains('priority-low') ? 'low' : null;
                dayTodos.push({ text: todoText, priority: priorityClass });
            });
            todos.push(dayTodos);
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }


    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.forEach((dayTodos, index) => {
            dayTodos.forEach(todo => {
                createTodoItem(todo.text, index + 1, todo.priority); // Priorität beim Erstellen übergeben
            });
        });
    }


    addBtn.addEventListener('click', function () {
        const todoText = todoInput.value.trim();
        const selectedDay = document.getElementById('day-select').value;
        const selectedPriority = document.getElementById('priority-select').value; // Priorität holen
        if (todoText !== '' && selectedDay !== '' && selectedPriority !== '') { // Überprüfen, ob alles ausgewählt wurde
            createTodoItem(todoText, parseInt(selectedDay), selectedPriority);
            todoInput.value = '';
            document.getElementById('priority-select').value = ''; // Dropdown zurücksetzen
        }
    });

    loadTodos();
});
