import React from 'react';
import Lottie from "lottie-react";
import NotFoundANimation from '../assets/lottie/not-found.json';
import {Button} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Notfound = () => {
    const navigate = useNavigate();

    const gotoHome = () => {
        navigate("/home")
    }

  return (
    <div className='w-full h-full flex items-center justify-center flex-col'>
        {/* <div className='w-[50%]'>
      <Lottie animationData={NotFoundANimation} loop={true} className='px-10 h-80'/>

        </div> */}
        <h1 className='text-6xl'>404</h1>
      <h2>Page you are looking for doesn't exist</h2>
      <Button variant='contained' color='primary' onClick={gotoHome}>Go to feed</Button>
    </div>
  )
}

export default Notfound
