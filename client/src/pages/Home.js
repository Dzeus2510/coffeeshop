import axios from "axios";
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from "../helpers/AuthContext";


function Home() {
    const [page, setPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [searchword, setSearchword] = useState("");
    const [paramSearch, setParamSearch] = useSearchParams("");
    const [listOfCafe, setListOfCafe] = useState([]);
    const [favouriteCafes, setFavouriteCafes] = useState([]);
    const { authState } = useContext(AuthContext);
    let navigate = useNavigate()

    const fetchData = async () => {
        try {
            const page = paramSearch.get('page') || 1;
            const searchword = paramSearch.get('searchword') || "";

            const response = await axios.get(`http://localhost:3001/cafes/?page=${page}&&searchword=${searchword}`, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            });
            setListOfCafe(response.data.listOfCafe);
            setMaxPage(response.data.maxPage);
            setFavouriteCafes(response.data.favouriteCafes.map((favourite) => favourite.coffeeplaceId));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login");
        } else {
            fetchData();
        }
    }, [page, searchword]);
    //if user not logged in, redirect to /login
    //else, set accesstoken in headers, and find all favourited cafe to highlight the favourite button, thus make it easier to detect which cafe user has favourited

    const handlePageChange = (newPage) => {
        setPage(newPage);
        setParamSearch({ page: `${newPage}`, searchword: (paramSearch.get('searchword') ? paramSearch.get('searchword') : "") });
        fetchData();
    };
    //Change page

    const searchCafe = async (newSearch) => {
        setSearchword(newSearch);
        setPage(1); // Reset page to 1
        setParamSearch({ page: 1, searchword: newSearch });
        fetchData();

        navigate(`/cafe/?page=1&searchword=${searchword}`, {
            replace: true, // Replace the current entry in the history stack
        });
    };
    //searchword

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
    //favourite a cafe

    return (
        <div>
            <div>PAGE {paramSearch.get('page') ? paramSearch.get('page') : (page)} / {maxPage}</div>
            <button style={{ display: paramSearch.get('page') <= 1 ? 'none' : '' }} onClick={() => handlePageChange(paramSearch.get('page') - 1)}>Previous</button>
            <button style={{ display: paramSearch.get('page') >= maxPage ? 'none' : '' }} onClick={() => handlePageChange(paramSearch.get('page') - 1 + 2)}>Next</button>
            <div>Searchword: {paramSearch.get('searchword')}</div>
            <form onSubmit={(e) => { e.preventDefault(); searchCafe(searchword); window.location.reload(); }}>
                <input type="text" name="searchword" value={searchword} onChange={(e) => setSearchword(e.target.value)}></input>
                <button type="submit">Search</button>
            </form>
            <div className="postDisplay">
                {listOfCafe.map((value, key) => {
                    return (
                        <div className="post">
                            <div className="title">{value.name}</div>
                            <div className="body" onClick={() => { navigate(`/cafe/${value.id}`) }}>
                                {value.address}<br></br>
                                Owner: {(value.UserId) ? (value.User.username) : "none"}<br></br>
                                <img src={value.image === 'No Img xD' ? "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg" : (value.image)} alt={value.name} width={200} height={180}></img>
                            </div>
                            <div className="footer">
                                <a href={(value.website === 'No Website') ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : value.website} target="_blank">
                                    {(value.website === 'No Website') ? "None Web" : "Website"}
                                </a>
                                <button id="favbtn" onClick={() => { favouriteACafe(value.id); }} className={favouriteCafes.includes(value.id) ? "unfavouritedCafe" : "favouritedCafe"}>{(favouriteCafes.includes(value.id)) ? "⭐" : "★"}</button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div>
                <div>PAGE {page} / {maxPage}</div>
                <button style={{ display: page <= 1 ? 'none' : '' }} onClick={() => handlePageChange(page - 1)}>Previous</button>
                <button style={{ display: page >= maxPage ? 'none' : '' }} onClick={() => handlePageChange(page + 1)}>Next</button>
            </div>
        </div>
    );
}

export default Home