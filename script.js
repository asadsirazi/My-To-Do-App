// Todo App JavaScript

// State Management
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let editingTodoId = null;
let deletingTodoId = null;

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const filterBtns = document.querySelectorAll('.filter-btn');
const todoModal = document.getElementById('todoModal');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const modalClose = document.querySelectorAll('.modal-close');
const editInput = document.getElementById('editInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editModalClose = document.getElementById('editModalClose');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Event Listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Close modals
modalClose.forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModals);
});

editModalClose.addEventListener('click', closeModals);
cancelEditBtn.addEventListener('click', closeModals);
cancelDeleteBtn.addEventListener('click', closeModals);
confirmDeleteBtn.addEventListener('click', confirmDelete);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModals();
    }
});

saveEditBtn.addEventListener('click', saveEdit);
editInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveEdit();
    }
});

// Functions

// Add new todo
function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a todo!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.unshift(todo);
    saveTodos();
    todoInput.value = '';
    todoInput.focus();
    renderTodos();
    updateStats();
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Delete todo - show confirmation modal
function deleteTodo(id) {
    deletingTodoId = id;
    deleteModal.classList.add('show');
}

// Confirm delete
function confirmDelete() {
    if (deletingTodoId !== null) {
        todos = todos.filter(t => t.id !== deletingTodoId);
        saveTodos();
        renderTodos();
        updateStats();
        deletingTodoId = null;
        closeModals();
    }
}

// View single todo
function viewTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        document.getElementById('modalText').textContent = todo.text;
        document.getElementById('modalStatus').textContent = todo.completed ? 'Completed' : 'Active';
        document.getElementById('modalStatus').className = 'modal-status ' + (todo.completed ? 'completed' : 'active');
        document.getElementById('modalDate').textContent = formatDate(todo.createdAt);
        todoModal.classList.add('show');
    }
}

// Open edit modal
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        editingTodoId = id;
        editInput.value = todo.text;
        updateCharCount();
        editModal.classList.add('show');
        editInput.focus();
        editInput.select();
    }
}

// Update character count
function updateCharCount() {
    const count = editInput.value.length;
    const charCountEl = document.getElementById('charCount');
    if (charCountEl) {
        charCountEl.textContent = count;
    }
}

// Add event listener for character count
editInput.addEventListener('input', updateCharCount);

// Save edited todo
function saveEdit() {
    const newText = editInput.value.trim();
    
    if (newText === '') {
        alert('Todo cannot be empty!');
        return;
    }

    const todo = todos.find(t => t.id === editingTodoId);
    if (todo) {
        todo.text = newText;
        saveTodos();
        renderTodos();
        closeModals();
    }
}

// Close all modals
function closeModals() {
    todoModal.classList.remove('show');
    editModal.classList.remove('show');
    deleteModal.classList.remove('show');
    editingTodoId = null;
    deletingTodoId = null;
    editInput.value = '';
}

// Render todos
function renderTodos() {
    let filteredTodos = todos;

    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})"></div>
            <span class="todo-text" onclick="viewTodo(${todo.id})">${escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="action-btn btn-view" onclick="viewTodo(${todo.id})">View</button>
                <button class="action-btn btn-edit" onclick="editTodo(${todo.id})">Edit</button>
                <button class="action-btn btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        </li>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app
function init() {
    renderTodos();
    updateStats();
    todoInput.focus();
}

// Start the app
init();
