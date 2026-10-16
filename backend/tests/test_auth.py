def test_register_student(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "newstudent@example.com",
        "password": "Password@123",
        "full_name": "New Student",
        "role": "student",
        "college": "Global Tech",
        "target_role": "Python Developer"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newstudent@example.com"
    assert data["user"]["role"] == "student"

def test_login_success(client, test_student):
    response = client.post("/api/v1/auth/login", json={
        "email": test_student.email,
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_student.email

def test_login_invalid_password(client, test_student):
    response = client.post("/api/v1/auth/login", json={
        "email": test_student.email,
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_me(client, test_student, student_auth_headers):
    response = client.get("/api/v1/auth/me", headers=student_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_student.email
