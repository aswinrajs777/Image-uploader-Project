import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import img1 from "../../assets/img1.jpg"
import profile from "../../assets/profile.png"
import Avatar from 'react-avatar'
import "./Dashboard.css"
const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('name');
    toast.error("logged out");
    navigate('/login');
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('auth-token') !== null;
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div >
        <div className='container-sm main-container d-flex flex-column justify-content-center'>
            <div className='container layout1'>
                <img src={img1} className="img-fluid bg1" alt="" srcset="" />
            </div>
            <div className='d-flex justify-content-between'>
            <Avatar  xs={6} sm={4} md={3} lg={2} className='profile' name="John Doe" size="200" round={true} src={profile} />
            <button className='btn btn-light upload-btn'>Upload image</button>
            </div>
            <h1 className='name'>Aswin</h1>
            <div className='container-sm d-flex gap-5 info'>
                <p>@aswin</p>
                <p>Frontend developer</p>
            </div>
        </div>
        <br /><br /><br />
      <Button variant="danger" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default Dashboard;
