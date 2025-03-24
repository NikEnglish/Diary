// Функция входа
function login() {
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;

  // Проверяем, заполнены ли поля
  if (!login || !password) {
    alert('Пожалуйста, заполните все поля.');
    return;
  }

  // Пытаемся войти
  database.ref('users').once('value', (snapshot) => {
    const users = snapshot.val();
    let userFound = false;

    for (const key in users) {
      if (users[key].login === login && users[key].password === password) {
        alert('Вход выполнен! Перенаправляем...');
        localStorage.setItem('currentUser', JSON.stringify(users[key]));

        // Перенаправляем на нужную страницу
        if (users[key].role === 'student') {
          window.location.href = 'student.html';
        } else if (users[key].role === 'teacher') {
          window.location.href = 'teacher.html';
        }

        userFound = true;
        break;
      }
    }

    if (!userFound) {
      alert('Неверный логин или пароль!');
    }
  }).catch((error) => {
    alert('Ошибка при входе. Попробуйте ещё раз.');
    console.error('Ошибка при входе:', error); // Если консоль станет доступна, это поможет
  });
}

// Загрузка меню учителя
function loadTeacherMenu() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  document.getElementById('teacher-name').textContent = currentUser.full_name;

  if (currentUser.can_register) {
    document.getElementById('register-button').style.display = 'block';
  }
}

// Показать форму регистрации
function showRegisterForm() {
  const form = `
    <h2>Регистрация</h2>
    <select id="role-select">
      <option value="teacher">Учитель</option>
      <option value="student">Ученик</option>
    </select>
    <input type="text" id="full-name" placeholder="ФИО">
    <input type="text" id="login" placeholder="Логин">
    <input type="password" id="password" placeholder="Пароль">
    <div id="teacher-fields" style="display: none;">
      <select id="subject-select">
        <option value="Математика">Математика</option>
        <option value="Физика">Физика</option>
      </select>
      <label>
        <input type="checkbox" id="can-register"> Может регистрировать
      </label>
    </div>
    <div id="student-fields" style="display: none;">
      <input type="text" id="class" placeholder="Класс">
      <input type="text" id="letter" placeholder="Буква класса">
    </div>
    <button onclick="register()">Зарегистрировать</button>
  `;
  document.getElementById('register-form').innerHTML = form;
  document.getElementById('register-form').style.display = 'block';
}

// Регистрация нового пользователя
function register() {
  const role = document.getElementById('role-select').value;
  const fullName = document.getElementById('full-name').value;
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;

  const userData = {
    login,
    password,
    role,
    full_name: fullName
  };

  if (role === 'teacher') {
    userData.subject = document.getElementById('subject-select').value;
    userData.can_register = document.getElementById('can-register').checked;
  } else if (role === 'student') {
    userData.class = document.getElementById('class').value;
    userData.letter = document.getElementById('letter').value;
  }

  database.ref('users').push(userData);
  alert('Регистрация успешна!');
  document.getElementById('register-form').style.display = 'none';
}

// Загрузка оценок ученика
function loadStudentGrades() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  document.getElementById('student-name').textContent = currentUser.full_name;

  database.ref(`grades/${currentUser.login}`).once('value', (snapshot) => {
    const grades = snapshot.val();
    const table = document.getElementById('grades-table');
    table.innerHTML = '<h2>Оценки</h2>';

    for (const subject in grades) {
      const subjectDiv = document.createElement('div');
      subjectDiv.innerHTML = `<h3>${subject}</h3>`;
      for (const quarter in grades[subject]) {
        const quarterDiv = document.createElement('div');
        quarterDiv.innerHTML = `<strong>${quarter}:</strong>`;
        for (const date in grades[subject][quarter]) {
          const gradesForDate = grades[subject][quarter][date];
          quarterDiv.innerHTML += `<div>${date}: ${gradesForDate.join('/')}</div>`;
        }
        subjectDiv.appendChild(quarterDiv);
      }
      table.appendChild(subjectDiv);
    }
  });
}
