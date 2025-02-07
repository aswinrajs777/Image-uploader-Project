import React, { useState,useEffect } from 'react';
import { Button, Image, Container, Row, Col } from 'react-bootstrap';
import './Profile.scss';
import img1 from '../../assets/img1.jpg';
import img2 from '../../assets/profile.png';
import { UploadButton } from "@bytescale/upload-widget-react";
import {toast} from "react-toastify";
import Popup from 'reactjs-popup';
import Modal from 'react-bootstrap/Modal';
import Avatar from 'react-avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useUser } from '../../Context/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
 
const baseUrl="https://image-uploader-project-4ezl.onrender.com";


const options = {
    apiKey: "public_W142ihkES6XEyK9bgMhE2tzJqKxp", 
    maxFileCount: 4,
    maxFileSizeBytes: 5242880,
    editor: {
    "images": {
      "allowResizeOnMove": true,
      "crop": true,
      "cropShape": "circ",
      "preview": true
    }
  },
  
  };


  

const Profile = () => {
    const { user, logout, updateProfileImage } = useUser();

    const [imgurl,setImgurl]=useState([]);
    const [imgdummy,setImgdummy]=useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [modalShow, setModalShow] = React.useState(false);
    const [status,setStatus]=useState(0);
    const [selectedUrl, setSelectedUrl] = useState('');


    
  useEffect(() => {
    if (!user.token) {
      window.location.href = '/login'; 
    }
  }, [user]);

function MyVerticallyCenteredModal(props) {
    const handleChange = (e) => {
        e.preventDefault();
        setSelectedUrl(e.target.value);
      };
      const handleclick = async () => {
        try {
          const response = await axios.post(
            `${baseUrl}/setProfileImageUrl`,
            { selectedUrl },
            {
              headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('auth-token'),
              },
            }
          );
    
          if (response.data.success) {
            setMessage('Profile image URL updated successfully');
            toast.success('Profile image URL updated successfully'); 
            updateProfileImage(selectedUrl); 
            props.onHide();
            
          } else {
            setError('Failed to update profile image URL');
          }
        } catch (error) {
          console.error('Error setting profile image URL:', error);
          setError('Failed to update profile image URL');
        }
      };
    
      const handleDelete = async (urlToDelete) => {
        try {
          const response = await axios.delete(`${baseUrl}/deleteImageUrl/${encodeURIComponent(urlToDelete)}`, {
            headers: {
              'auth-token': localStorage.getItem('auth-token'), 
            },
          });
    
          // console.log(response.data); 
          toast.success('Image URL deleted successfully');
          setStatus(status+1);
         
        } catch (error) {
          console.error('Error deleting image URL:', error);
          toast.error('Failed to delete image URL', {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 3000, 
          });
        }
      };
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Modal heading
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
        <h1>Image URLs</h1>
      {error && <p>{error}</p>}
      {imgurl.map((url, index) => (
        <div key={index} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={url} facebookId="0000000000" round={true} size="150" />
            <Button 
              variant="outline-secondary btn-no-border" 
              onClick={() => handleDelete(url)}
              style={{ marginLeft: '10px',marginTop:'10px' }} 
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
         
          <div style={{ position: 'relative' }}>
            <input 
              type="radio" 
              id={`profile-${index}`} 
              name="profile" 
              value={url} 
              checked={selectedUrl === url}
              onChange={handleChange} 
              style={{ position: 'absolute', top: '0', right: '0' }}
            />
          </div>
        </div>
      ))}
      
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleclick}>Select</Button>
        </Modal.Footer>
      </Modal>
    );
  }



    useEffect(() => {
        const fetchImageUrls = async () => {
          try {
            const token = localStorage.getItem('auth-token');
            const response = await fetch(`${baseUrl}/imageUrls`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'auth-token': token,
              },
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // console.log(data.imageUrls)
              setImgurl(data.imageUrls);
            } else {
              setError(data.errors);
            }
          } catch (error) {
            console.error('Error fetching image URLs:', error);
            setError('Failed to fetch image URLs');
          }
        };
    
        fetchImageUrls();
      }, [status,]);

    const onUpload = async(files)=>{
        setImgdummy(files);
        const newImageUrls = files.split(/\r?\n/);
        console.log(newImageUrls)
        setImageUrls([...imageUrls, ...newImageUrls]);
        console.log(imageUrls)
        

        if(imgurl)
        {
            toast.success("image added");
            
            // console.log(imageUrls);
            try {
                const token = localStorage.getItem('auth-token');
                const response = await fetch(`${baseUrl}/setImageUrls`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token,
                  },
                  body: JSON.stringify({ newImageUrls}),
                });
          
                const data = await response.json();
          
                if (response.ok) {
                  setModalShow(true)
                  setStatus(status+1);
                } else {
                  setMessage(data.errors);
                }
              } catch (error) {
                console.error('Error setting image URLs:', error);
                setMessage('Failed to update image URLs');
              }
        }
        
        
    }

    const handleLogout = () => {
        logout(); 
        window.location.href = '/login'; 
      };
    // console.log(selectedUrl);
  return (
    <>
    <Container fluid className="d-flex justify-content-center py-4">
      <div className="profile-card">
        <div className="profile-header">
          <Image
            src={img1}
            className="profile-background"
            alt="Profile Background"
            fluid
          />
        </div>
        <div className="profile-picture1">
          <Image
            src={user.profileimage?user.profileimage:img2}
            className="profile-picture mx-3"
            roundedCircle
            alt="Profile"
            fluid
          />
          
        </div>
        <div className="upload-button1 ">
            
            <UploadButton  options={options} onComplete={files => onUpload(files.map(x => x.fileUrl).join("\n"))}>
                {({onClick}) =>
                <Button className='btn' variant='light outline-secondary' onClick={onClick}>
                    Upload Photo
                </Button>
                
                }
                
            </UploadButton>
            
        </div>
        <div className="profile-info ">
        
            <h2 className="my-3">{user.name}</h2>
            <p className="my-3">@kingjack &bull; Senior Product Designer at <span className="webflow-logo">Webflow</span> &bull; He/Him</p>
        </div>
        
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      </div>
      
    </Container>
    <center> 
    <Button className='justify-content-center' variant="danger" onClick={handleLogout}>Logout</Button>
    </center>
    </>

  );
};

export default Profile;
