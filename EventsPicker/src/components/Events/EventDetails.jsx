import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const params = useParams()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)


  const {data ,isLoading, isError, error} = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({signal}) => fetchEvent({signal, id: params.id})
  })

  const {mutate} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      })
      navigate('..')
    }
  })
  function handleStartDelete(){
    setIsDeleting(true)
  }
  function handleCancelDelete(){
    setIsDeleting(false)
  }

  function handleClick(){
    mutate({id: params.id})
  }

  let content;
  if(isLoading){
    content = <div id='event-details-content' className='center'><LoadingIndicator /></div>
  }
  if(isError){
    content = <div id='event-details-content' className='center'><ErrorBlock title={'Could not load event'} message={error.info?.message} /></div>
  }
  if(data){
    content = <>
      <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
    <div id="event-details-content">
    <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
    <div id="event-details-info">
      <div>
        <p id="event-details-location">{data.location}</p>
        <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
      </div>
      <p id="event-details-description">{data.description}</p>
    </div>
  </div>
    </>
    
  }
  return (
    <>
    {isDeleting && 
    <Modal onClose={handleCancelDelete}>
      <h2>Are you sure?</h2>
      <p>Do you want to delete this event?</p>
      <div className='form-actions'>
        <button onClick={handleClick} className='button'>Delete</button>
        <button onClick={handleCancelDelete} className='button-text'>Cancel</button>
      </div>
    </Modal> }
    
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
