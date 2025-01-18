import '../../styles/homepage.css'


export default function DecksBlock({classname,title,hehe}){

    return ( <div className={classname}>
                <h2 className="title">{title}</h2>
                <div className="card-container">
              <div className="card">Card 1</div>
              <div className="card">Card 2</div>
              <div className="card">Card 3</div>
              <div className="card">Card 4</div>
            </div>
      </div>)

}
