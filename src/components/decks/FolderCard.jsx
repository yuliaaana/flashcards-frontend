import '../../styles/folders.css'


export default function FolderCard({className,created_at,name,decks}){

    const formattedDate = new Date(created_at).toISOString().split('T')[0];
    return ( <div className={`${className} foldercard-container`}>

  
                <div className='foldercard-items'><h4 className='name'>{name}</h4>
                <h5>Created at : {formattedDate}</h5>
                </div>
                <div className='foldercard-items'>
                <h6>Decks:</h6>
                <ul>
                    {decks.map((item) => (
                        <li key={item.id}>{item.name}</li>
                    ))}
                </ul>
                </div>
                <div className='foldercard-items'>
                <button class="btn"><i class="material-icons">edit</i></button>
                <button class="btn"><i class="material-icons">delete</i></button>
                <button class="btn"><i class="material-icons">share</i></button>

                </div>

                {/*<div className='buttons-container'>
                <button className='buttons-items' type="button">Start studying</button>
                <button className='buttons-items' type="button">Edit</button>
                <button className='buttons-items' type="button">Delete</button>
                </div>*/}
      </div>)

}
