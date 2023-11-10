import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Cafe() {
    let { id } = useParams();
    const [cafeObject, setCafeObject] = useState({});
    const [favourite, setFavourite] = useState([])
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const { authState } = useContext(AuthContext);

    let nav = useNavigate()
    useEffect(() => {
        axios.get(`http://localhost:3001/cafes/byId/${id}`, {
            headers: { accessToken: localStorage.getItem("accessToken") },
        }).then((response) => {
            setCafeObject(response.data);
            setFavourite(response.data.Favourites)
        });
        //get the cafe with the chosen id

        axios.get(`http://localhost:3001/reviews/${id}`).then((response) => {
            setReviews(response.data);
        });
    }, [id]);
    //get all the reviews of the cafe

    const addReview = () => {
        axios
            .post(
                "http://localhost:3001/reviews",
                {
                    reviewBody: newReview,
                    coffeeplaceId: cafeObject.id,
                },
                {
                    headers: {
                        accessToken: localStorage.getItem("accessToken"),
                    },
                }
            )
            //set review and headers
            .then((response) => {
                if (response.data.error) {
                    console.log(response.data.error);
                } else {
                    window.location.reload(false);
                }
            });
    };
    //if log error, else add a new review to page

    const deleteReview = (id) => {
        axios
            .delete(`http://localhost:3001/reviews/${id}`, {
                headers: { accessToken: localStorage.getItem("accessToken") },
            })
            .then(() => {
                setReviews(
                    reviews.filter((val) => {
                        return val.id !== id;
                    })
                );
            });
    };
    //delete the review

    const claimCoffee = (event) => {
        event.stopPropagation();
        let claimaddress = prompt("Please Re-enter the coffee address");
        if(claimaddress === cafeObject.address) {
            axios.post(`http://localhost:3001/cafes/claimcoffee/${id}`,{
        },
        {
            headers: { accessToken: localStorage.getItem("accessToken") },
        })
            alert('You have claimed the coffeeshop');
        } else if (claimaddress == null) {
            alert('You have cancelled!');
        } else {
            alert('You inputed the wrong address!');
        }
    }

    const disclaimCoffee = (event) => {
        event.stopPropagation();
        if(window.confirm('Are u sure want to disclaimlete?')) {
            axios.post(`http://localhost:3001/cafes/disclaim/${id}`,{
        },
        {
            headers: { accessToken: localStorage.getItem("accessToken") },
        })
            alert('disclaimed');
        } else {
            alert('You have cancelled!');
        }
    }

    const favouriteACafe = () => {
        axios.post(`http://localhost:3001/favourites/cafe`,{
            coffeeplaceId: cafeObject.id,
        },
        {
            headers: { accessToken: localStorage.getItem("accessToken") },
        }).then((response) => {
            if (response.data.error) {
                console.log(response.data.error)
            } else {
                window.location.reload(false);
            }
        })
    }
    //favourite a cafe

    return (
        <div className="postPage">
            <div className="leftSide">
                <div className="postCafe" id="individual">
                    <div className="title"> {cafeObject.name} </div>
                    <div className="body" style={{backgroundImage:(cafeObject.image === "No Img XD") ? "" : `url(${cafeObject.image})`, backgroundSize: "cover"}}>
                        <div>{cafeObject.cat}</div>
                        <p>{cafeObject.address}</p>
                        <div>{cafeObject.phone}</div>
                        <div>{cafeObject.stars}⭐({cafeObject.review})</div>
                    </div>
                    <div className="footer">
                        <a href={(cafeObject.website === 'No Website') ?  'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : cafeObject.website} target="_blank">
                        {(cafeObject.website === 'No Website') ? "No Website xD" : "Website"}
                        </a>
                        <button onClick={favouriteACafe} className={(favourite.length !== 0) ? "unfavouritedCafe" : "favouritedCafe"}>{(favourite.length !== 0) ? "⭐" : "★"}</button>
                    </div>
                    <p>{(cafeObject.UserId) ? `This coffee is owned by ${cafeObject.User.username}` : `No User owned this coffeeshop` }</p>
                    <button style={{ display: cafeObject.UserId != null ? 'none' : '' }} onClick={claimCoffee}>Claim</button>
                    <button style={{ display: cafeObject.UserId == authState.id ? '' : 'none' }} onClick={disclaimCoffee}>Disclaim</button>
                </div>
            </div>
            <div className="rightSide">
                <div className="addCommentContainer">
                    <input
                        type="text"
                        placeholder="Your Review..."
                        autoComplete="off"
                        value={newReview}
                        onChange={(event) => {
                            setNewReview(event.target.value);
                        }}
                    />
                    <button onClick={addReview}> Add Review</button>
                </div>
                <div className="listOfReviews">
                    {reviews.map((review, key) => {
                        return (
                            <div key={key} className="review">
                                {review.reviewBody}
                                <label onClick={() => { nav(`/profile/${authState.id}`) }} style={{ color: "red" }}>= {review.username}</label>
                                {authState.username === review.username && (
                                    <button
                                        onClick={() => {
                                            deleteReview(review.id);
                                        }}
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Cafe;