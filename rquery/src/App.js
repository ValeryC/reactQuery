import { useQuery, isError } from 'react-query'
import './App.css';

const fetchUsers = async () => {
  const res = await fetch("https://reqres.in/api/users?per_page=12")
  return res.json()
}

function App() {
  const { isLoading, data, isError } = useQuery("users", fetchUsers)
  console.log(data)

  if (isLoading) return (<div className="App">Loading...</div>)
  if (isError) return (<div className="App">Erreur</div>)
  return (<div className="App">
    <h2>List of Users </h2>
    <ul>
      {data.data.map(user => (
        <li key={user.id}>
          {user.first_name} {user.last_name}
        </li>
      ))}
    </ul>
  </div>)
}

export default App;
