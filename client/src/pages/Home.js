import axios from "axios";
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../helpers/AuthContext";


function Home() {
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [searchword, setSearchword] = useState('');
    const [listOfCafe, setListOfCafe] = useState([]);
    const [favouriteCafes, setFavouriteCafes] = useState([]);
    const { authState } = useContext(AuthContext);
    let navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login")
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = urlParams.get("page");
            const searchParam = urlParams.get("searchword")
            setPage(pageParam ? parseInt(pageParam) : 1);
            setSearchword(searchParam ? searchParam : "")
            axios.get(`http://localhost:3001/cafes/?page=${page}&&searchword=${searchword}`, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            }).then((response) => {
                setListOfCafe(response.data.listOfCafe);
                setMaxPage(response.data.maxPage);
                setFavouriteCafes(response.data.favouriteCafes.map((favourite) => {
                    return favourite.coffeeplaceId;
                }));
            });
        }
    }, [page, searchword]);
    //if user not logged in, redirect to /login
    //else, set accesstoken in headers, and find all favourited cafe to highlight the favourite button, thus make it easier to detect which cafe user has favourited

    const handlePageChange = (newPage) => {
        setPage(newPage);
        navigate(`/?page=${newPage}&&searchword=${searchword}`, {
            headers: { accessToken: localStorage.getItem("accessToken") }
        })
    };

    const searchCafe = (event) => {
        setPage(1);
        setSearchword(event.target.value);
        navigate(`/?page=${page}&&searchword=${event.target.value}`, {
            headers: { accessToken: localStorage.getItem("accessToken") }
        });
    }

    const favouriteACafe = (cafeId) => {
        axios.post("http://localhost:3001/favourites", { CafeId: cafeId }, {
            headers: { accessToken: localStorage.getItem("accessToken") }
        }).then((response) => {
            setListOfCafe(listOfCafe.map((cafe) => {
                if (cafe.id === cafeId) {
                    if (response.data.favourited) {
                        return { ...cafe, Favourites: [...cafe.Favourites, 0] }
                    } else {
                        const favouriteArray = cafe.Favourites
                        favouriteArray.pop()
                        return { ...cafe, Favourites: favouriteArray }
                    }
                } else {
                    return cafe;
                }
            }))
            if (favouriteCafes.includes(cafeId)) {
                setFavouriteCafes(
                    favouriteCafes.filter((id) => {
                        return id !== cafeId;
                    })
                )
            } else {
                setFavouriteCafes([...favouriteCafes, cafeId])
            }
        })
    }


    return (
        <div>
            <div>PAGE {page} / {maxPage}</div>
            <button style={{ display: page <= 1 ? 'none' : '' }} onClick={() => handlePageChange(page - 1)}>Previous</button>
            <button style={{ display: page >= maxPage ? 'none' : '' }} onClick={() => handlePageChange(page + 1)}>Next</button>
            <form>
                <input type="text" name="searchword" onSubmit={searchCafe}></input>
                <button type="submit">Search</button>
            </form>
            {listOfCafe.map((value, key) => {
                return (
                    <div className="post"  >
                        <div className="title">{value.name}</div>
                        <div className="body" onClick={() => { navigate(`/cafe/${value.id}`) }}>
                            {value.address}<br></br>
                            {value.phone}
                            <img src={value.image === 'No Img xD' ? "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg" : (value.image)} alt={value.name} width={120} height={120}></img>
                        </div>
                        <div className="footer">
                            <a href={(value.website === 'No Website') ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : value.website}>
                                {(value.website === 'No Website') ? "No Website xD" : "Website"}
                            </a>
                            <button id="favbtn" onClick={() => { favouriteACafe(value.id); }} className={favouriteCafes.includes(value.id) ? "unfavouritedCafe" : "favouritedCafe"}>{(favouriteCafes.includes(value.id)) ? "⭐" : "★"}</button>
                        </div>
                    </div>
                );
            })}
            <div>
            <div>PAGE {page} / {maxPage}</div>
            <button style={{ display: page <= 1 ? 'none' : '' }} onClick={() => handlePageChange(page - 1)}>Previous</button>
            <button style={{ display: page >= maxPage ? 'none' : '' }} onClick={() => handlePageChange(page + 1)}>Next</button>
            </div>
        </div>
    );
}

export default Home