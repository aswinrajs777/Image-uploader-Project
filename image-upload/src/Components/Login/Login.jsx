import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; 
import { useUser } from '../../Context/UserContext'; 
import { toast } from 'react-toastify';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let responseData;
      await fetch('https://image-uploader-project-4ezl.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }).then((Response)=>Response.json()).then((data)=>responseData=data);


      if (responseData.success) {
        login(responseData.token, responseData.name, responseData.id,responseData.profileimage); 
        toast.success("logged In");
        navigate('/profile');
      } else {
        setError(responseData.errors);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <Container fluid className="justify-content-md-center login-container">
      <Row className="justify-content-md-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <h2 className="text-center">Login</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {error && <p className="text-danger">{error}</p>}

            <Button variant="primary" type="submit" block>
              Submit
            </Button>
          </Form>
          <div className='reg-div'>
            <p variant="outline-secondary" className='reg1'>Don't have an account?</p>
            <Link to="/register">
              <p variant="outline-secondary" className="register-button">Register</p>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
