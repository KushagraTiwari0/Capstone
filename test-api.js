import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testApi() {
  console.log('--- Registering Teacher for Class 6 ---');
  let res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Teacher 6',
      email: 'teacher6@geep.com',
      password: 'password123',
      role: 'teacher',
      classLevel: '6'
    })
  });
  let data = await res.json();
  console.log('Teacher 6 Register:', data);
  // Remember teacher is pending by default, but let's check its classLevel
  
  console.log('--- Registering Student for Class 6 ---');
  res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student 6',
      email: 'student6@geep.com',
      password: 'password123',
      role: 'student',
      classLevel: '6'
    })
  });
  data = await res.json();
  console.log('Student 6 Register:', data);

  console.log('--- Registering Student for Class 7 ---');
  res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student 7',
      email: 'student7@geep.com',
      password: 'password123',
      role: 'student',
      classLevel: '7'
    })
  });
  data = await res.json();
  console.log('Student 7 Register:', data);

  console.log('--- All registrations attempt sent ---');
}

testApi();
