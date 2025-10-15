import React, {useState} from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_API || 'http://localhost:4000';

export default function Register(){
  const [form, setForm] = useState({name:'', email:'', password:''});
  const [msg, setMsg] = useState('');
  const submit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/v1/auth/register`, form);
      setMsg('Registered. Token saved to localStorage.');
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error');
    }
  };
  return (
    <div>
      <h3>Register</h3>
      <form onSubmit={submit}>
        <input placeholder="name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /><br/>
        <input placeholder="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /><br/>
        <input placeholder="password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} /><br/>
        <button>Register</button>
      </form>
      <div>{msg}</div>
    </div>
  );
}