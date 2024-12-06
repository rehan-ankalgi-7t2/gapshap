import React from 'react'

const Login = () => {
  return (
    <div className='grid-col-2 w-[100%] '>
      <div className='col-span-2'></div>
      <div>
        <form action="">
            <div>
                <label htmlFor=""></label>
                <input type="text" />
                <span></span>
            </div>
            <div>
                <label htmlFor=""></label>
                <input type="text" />
                <span></span>
            </div>
            <button type='submit' className='px-4 py-2 bg-red-500 text-white rounded-sm'>Login</button>
        </form>
      </div>
    </div>
  )
}

export default Login;
