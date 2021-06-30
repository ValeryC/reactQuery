import { Fragment, useRef } from 'react';
import { useQuery, useInfiniteQuery } from 'react-query'
import useIntersectionObserver from "./hook/useIntersectionObserver"
import './App.css';

const fetchUsers = async () => {
  const res = await fetch(`https://reqres.in/api/users?{pageParam}&per_page=3`)
  return res.json()
}

function App() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery('users', fetchUsers, {
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.page < lastPage.total_pages) return lastPage.page + 1
    }
  })

  const loadMoreButtonRef = useRef()

  useIntersectionObserver({
    target: loadMoreButtonRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  })


  console.log(data)

  if (isLoading) return (<div className="App">Loading...</div>)
  if (isError) return (<div className="App">Erreur</div>)
  return (<div className="App">
    <h2>List of Users </h2>

    {data.pages.map((group, i) => (

      <Fragment key={i}>
        {group.data.map(user =>
          <div key={user.id} className="list">
            {user.first_name} {user.last_name}
          </div>
        )}
      </Fragment>
    ))}
    <button
      ref={loadMoreButtonRef}
      onClick={() => fetchNextPage()}
      disabled={!hasNextPage || isFetchingNextPage}
    >
      {isFetchingNextPage
        ? 'Loading more...'
        : hasNextPage
          ? 'Load More'
          : 'Nothing more to load'}
    </button>
    <div>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
  </div>)
}

export default App;
