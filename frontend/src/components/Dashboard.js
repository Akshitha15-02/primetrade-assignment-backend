import React, {useState, useEffect} from 'react';
import axios from 'axios';
const API = process.env.REACT_APP_API || 'http://localhost:4000';

export default function Dashboard(){
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({title:'', description:''});
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('token');
  useEffect(()=>{ fetchTasks(); }, []);
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/v1/tasks`, { headers: { Authorization: `Bearer ${token}` }});
      setTasks(res.data);
    } catch (err) { setMsg(err.response?.data?.error || 'Error fetching'); }
  };
  const createTask = async e => {
    e.preventDefault();
    try {
      await axios.post(`${API}/v1/tasks`, form, { headers: { Authorization: `Bearer ${token}` }});
      setMsg('Created');
      setForm({title:'', description:''});
      fetchTasks();
    } catch (err) { setMsg(err.response?.data?.error || 'Error'); }
  };
  const del = async (id) => {
    try {
      await axios.delete(`${API}/v1/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      setMsg('Deleted');
      fetchTasks();
    } catch (err) { setMsg(err.response?.data?.error || 'Error'); }
  };
  return (
    <div>
      <h3>Dashboard (protected)</h3>
      <div>{msg}</div>
      <form onSubmit={createTask}>
        <input placeholder="title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} /><br/>
        <input placeholder="description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} /><br/>
        <button>Create</button>
      </form>
      <h4>Your tasks</h4>
      <ul>
        {tasks.map(t=>(
          <li key={t.id}>
            <b>{t.title}</b> - {t.description} - {t.status}
            <button onClick={()=>del(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}