import QRCode from "qrcode.react";
import {Header} from "@/pages/index";
import {useEffect, useRef, useState} from "react";
import {get, isEmpty} from "lodash";
import classNames from "classnames";
import {CheckIcon} from "@heroicons/react/20/solid";
import Head from "next/head";
function createVerification(contactId, invitationId) {
  return fetch(`/api/verifications`, {
    method: "POST",
    body: JSON.stringify({
      contact_id: contactId,
      invitation_id: invitationId,
    }),
  }).then(r => r.ok ? r.json() : null);
}
function createSession(invitation, sessionId) {
  return new Promise(function (resolve, reject) {
    const oldSession = JSON.parse(localStorage.getItem("session"));
    const newSession = {
      ...oldSession,
      id: sessionId,
      invitation_id: invitation.invitation_id,
      contact_id: invitation.contact_id,
      state: 'connected',
    };
    localStorage.setItem("session", JSON.stringify(newSession));
    resolve(newSession);
  });
}
function createInvitation() {
  return fetch(`/api/invitations`, {method: "POST"}).then(r => r.ok ? r.json() : null)
}
function getVerification(id) {
  return fetch(`/api/verifications/${id}`)
    .then(r => r.ok ? r.json() : null);
}
function getInvitation(id) {
  return fetch(`/api/invitations/${id}`).then(r => r.ok ? r.json() : null);
}
function hasSessionExpired(session) {
  const sessionDate = new Date(session.created_at);
  const now = new Date();
  const diff = now - sessionDate;
  const minutes = Math.floor(diff / 1000 / 60);

  return (minutes > 30);
}
async function findSession(sessionId) {
  if (isEmpty(sessionId)) return null;
  const lsSession = localStorage.getItem("session");
  return JSON.parse(lsSession);
}
async function findCredential(sessionId) {
  return fetch(`/api/credentials?session_id=${sessionId}`).then(r => r.json());
}
export default function DashboardPage() {

  function handleConnection(invitation) {
    createSession(invitation, sessionId).then(setSession);
  }

  function handleCredential(cred) {
    setCredential(cred);
    window.localStorage.setItem('credential', JSON.stringify(cred));
  }

  function handleCredentialDelete() {
    setCredential(null);
    window.localStorage.removeItem('credential');
  }

  const [state, setState] = useState('loading');
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [credential, setCredential] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (window.localStorage.hasOwnProperty('session_id')) {
      setSessionId(localStorage.getItem("session_id"));
    }

    if (window.localStorage.hasOwnProperty('credential')) {
      setCredential(JSON.parse(localStorage.getItem("credential")));
    }

    setState('loaded');
  }, [])

  function clearSession() {
    localStorage.removeItem("session");
    setSession(null);
    setState('not_identified');
  }

  useEffect(() => {
    if (isEmpty(session)) {
      return;
    }
    setState(session.state);
  }, [session]);

  useEffect(() => {
    if (isEmpty(sessionId)) {
      setState('session_expired');
      return;
    }
    Promise.all([findSession(sessionId)])
      .then(r => {
        console.log(r[1]);
        if (r[0] !== null) {
          setSession(r[0]);
        }
      });
  }, [sessionId]);

  const isReturningUser = !isEmpty(session)
    && session.state === 'connected'
    && isEmpty(credential);
  const hasCredential = !isEmpty(credential);
  const requiresInvitation = !isEmpty(session) && sessionId && state === 'none';
  const isInvalid = isEmpty(session) && !sessionId && state === 'session_expired';

  return (
    <main>
      <Head>
        <link rel="icon" type="image/png" href="/tanz-bank.png"/>
        <title>tANZ Bank</title>
      </Head>
      <Header/>

      <div className="container mx-auto py-10 grid grid-cols-4 gap-10">
        <div className="col-span-1">
          <Wizard
          />
        </div>

        <div className="col-span-3">
          {state === 'loading' && (<LoadingComponent/>)}

          <div className="container mx-auto gap-8">

            {state !== 'loading' && (
              <>
                {/* User has credential, yay */}
                {hasCredential && (<DisplayCredentialComponent credential={credential} session={session} onDelete={handleCredentialDelete}/>)}

                {/* User is coming back after some time, let them present FarmID again */}
                {isReturningUser && (<ReturningUserComponent session={session} onCredential={handleCredential} />)}

                {/* No connection set up yet, allow the user to create it */}
                {requiresInvitation && (<CreateInvitationComponent onConnected={handleConnection}/>)}

                {/* Invalid Session Detected */}
                {isInvalid && (<InvalidSessionComponent/>)}
              </>
            )}

          </div>
        </div>
      </div>

    </main>
  )
}

function LoadingComponent() {
  return (
    <div>
      Loading..
    </div>
  )
}

function DisplayCredentialComponent({ credential, session, onDelete }) {
  function handleDeleteCredentialClick() {
    if (confirm('Are you sure you want to reset your Scope 3 Emissions data?')) {
      fetch(`/api/credentials?session_id=${session.id}`, {
        method: "DELETE",
      }).then(() => {
        onDelete();
      });
    }
  }
  return (
    <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden border border-[#00304b]">
      <h1 className="text-xl leading-tight border-b text-white bg-[#00304b] px-4 py-4 font-semibold">Your GHG Report Has been Verified</h1>
      <div className="grid grid-cols-2 bg-white gap-4 p-6">
        {Object.keys(get(credential, 'claims', {})).map((k, i) => (
          <div key={i} className="max-h-64 overflow-hidden ellipsis">
            <div className="text-gray-600 mb-1 text-xs">{k}: </div>
            <div className="text-black text-md">
              <ClaimItem name={k} value={get(credential, `claims.${k}`)}/>
            </div>
          </div>
        ))}
      </div>
      <div>
        <button className="btn btn-danger hover:text-red-600" onClick={handleDeleteCredentialClick}>Delete Credential</button>
      </div>
    </div>
  )
}

function InvalidSessionComponent() {
  return (
    <div>
      <h2 className="text-rose-400">Invalid Session, Please restart the demo</h2>
      <a href={process.env.NEXT_PUBLIC_DEMO_URL}><span className="underline">Click here</span> to go back to the demo homepage</a>
    </div>
  )
}
function CreateInvitationComponent({ onConnected }) {
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const interval = useRef(null);

  function handleInviteClick() {
    setIsLoading(true);
    createInvitation()
      .then(setInvitation)
      .catch(err => {
        console.error({err});
      });
  }

  useEffect(() => {
    if (isEmpty(invitation)) return;

    interval.current = setInterval(() => {
      handleInvitationSync();
    }, 2500);

    return () => {
      clearInterval(interval.current);
    }
  }, [invitation]);


  async function handleInvitationSync() {
    getInvitation(invitation.invitation_id)
      .then(inv => {
        setInvitation(inv.invitation);

        if (inv.invitation.state === 'active') {
          return onConnected(inv.invitation)
        }
      })
  }

  const hasInvitation = !isEmpty(invitation) && invitation.invitation_url;

  return (
    <div>
      {!hasInvitation && (
        <button className="login-btn" onClick={handleInviteClick}>Connect to Credential Wallet</button>
      )}

      {hasInvitation && (
        <div className="mb-4">
          <div className="p-2 rounded border bg-white inline-block">
            <QRCode
              value={invitation.invitation_url}
              size={256}
              renderAs="svg"
            />
            <div className="bg-blue-100 p-2 border-blue-600 text-blue-600 font-semibold text-sm text-center">Scan using your Credential Wallet</div>
          </div>
        </div>
      )}
    </div>
  )
}

function Wizard() {
  const steps = [
    { name: 'Create account', description: 'Set up your tANZ Account', href: '#', status: 'complete' },
    {
      name: 'Profile information',
      description: 'Tell us about yourself',
      href: '#',
      status: 'complete',
    },
    { name: 'Business information', description: 'Describe your farm', href: '#', status: 'complete' },
    { name: 'GHG', description: 'Validate your GHG Credential', href: '#', status: 'current' },
    { name: 'Review', description: 'Review your application', href: '#', status: 'upcoming' },
  ]

  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={classNames(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
            {step.status === 'complete' ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-[#004165]" aria-hidden="true" />
                ) : null}
                <a href={step.href} className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#004165] group-hover:brightness-150">
                      <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{step.name}</span>
                    <span className="text-sm text-gray-500">{step.description}</span>
                  </span>
                </a>
              </>
            ) : step.status === 'current' ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
                ) : null}
                <a href={step.href} className="group relative flex items-start" aria-current="step">
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#004165] group-hover:brightness-150 bg-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#004165] " />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-[#004165] ">{step.name}</span>
                    <span className="text-sm text-gray-500">{step.description}</span>
                  </span>
                </a>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" aria-hidden="true" />
                ) : null}
                <a href={step.href} className="group relative flex items-start">
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                    </span>
                  </span>
                  <span className="ml-4 flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-gray-500">{step.name}</span>
                    <span className="text-sm text-gray-500">{step.description}</span>
                  </span>
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
function ClaimItem({ name, value }) {
  switch (name) {
    case 'full_report_pdf_url':
      return <a className="underline text-[#007dba]">{value}</a>
    case 'co2e':
      return <h1 className="text-2xl font-bold">{value}</h1>
    case 'n2o':
    case 'ch4':
    case 'total':
      return <div className="text-xs">{value}</div>
    default:
      return <div>{value}</div>
  }
}
function ReturningUserComponent({ session, existingVerification = null, onCredential }) {
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setVerification] = useState(existingVerification);
  const interval = useRef(null);

  useEffect(() => {
    if (isEmpty(verification)) return;
    if (!isLoading) {
      setIsLoading(true);
    }

    interval.current = setInterval(() => {
      if (verification.complete !== true) {
        handleVerificationSync();
        return;
      }
      clearInterval(interval.current);
    }, 2500);

    return () => {
      clearInterval(interval.current);
    }
  }, [verification]);

  async function handleVerificationSync() {
    getVerification(verification.verification_id)
      .then(ver => {
        setVerification(ver)
        window.sessionStorage.setItem('verification_id', ver.verification_id);

        if (ver.complete === true && ver.result_string === 'Verified') {
          setIsLoading(false);

          let attributes = {}
          ver.result_data.forEach(attr => {attributes[attr.name] = attr.value})

          onCredential({
            state: 'issued',
            claims: attributes,
          });
        }
      })
      .catch(err => {
        console.error({err});
        setIsLoading(false);
      })
  }

  function handleSigninClick() {
    setIsLoading(true);
    createVerification(session.contact_id, session.invitation_id)
      .then(newVerification => {
        console.log({newVerification})
        setVerification(get(newVerification, '0'));
      })
      .catch(err => {
        console.error({err});
      })
  }

  return (
    <div className="col-span-3">

    <div className="bg-white text-black font-semibold mb-8">
      <div className="rounded-lg bg-blue-100 text-blue-600 inline-flex items-center gap-1 w-auto px-3 py-1 border border-blue-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/></svg>
        Connected To Wallet
      </div>
    </div>

    <div className="mb-8">
      <button
        disabled={isLoading}
        onClick={handleSigninClick}
        type="button"
        className={classNames({
          "inline-flex rounded-full bg-green-600 p-1 gap-2 items-center pr-4 text-white hover:bg-green-700/90 hover:shadow cursor": true,
          'opacity-50 cursor-not-allowed': isLoading,
        })}
      >
        <div className="h-10 w-10 bg-green-900 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"/></svg>
        </div>
        <div className="text-lg font-semibold !text-white">
          {isLoading ? 'Pending Verification' : 'Present your GHG Credential'}
        </div>
      </button>
    </div>

    {(!isEmpty(verification)) && (
      <div className="shadow-lg border-2 px-6 py-4 flex items-center text-xl gap-4 text-[#007dba]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd"/></svg>
        Please check your credential wallet for a notification!
      </div>
    )}
  </div>
  )
}
// function createCredential(sessionId, attributes) {
//   return fetch(`/api/credentials`, {
//     method: "POST",
//     body: JSON.stringify({
//       session_id: sessionId,
//       attributes,
//     })
//   }).then(r => r.json());
// }
