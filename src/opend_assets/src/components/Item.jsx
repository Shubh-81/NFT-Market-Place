import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import {Actor,HttpAgent} from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft/index";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";
import {Principal} from '@dfinity/principal';
import { opend } from "../../../declarations/opend/index";
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  let NFTActor;
  const id = props.id;

  const localhost = "http://localhost:8080/";
  const agent = new HttpAgent({host: localhost});
  const [blur,setBlur] = useState();
  agent.fetchRootKey();

  const [sellStatus,setSellStatus] = useState("");
  const [priceLabel,setPriceLabel] = useState();
  const [nftName,setNFTName] = useState(undefined);
  const [nftOwner,setNFTOwner] = useState("");
  const [nftAsset,setNFTAsset] = useState(undefined);
  const [button,setButton] = useState();
  const [priceInput,setPriceInput] = useState();
  const [loaderHidden,setLoaderHidden] = useState(true);
  const [shouldDisplay,setShouldDisplay] = useState(true);

  let price;

  const handleBuy = async () =>{
    setLoaderHidden(false);
    console.log("Buy was clicked");
    const tokenActor = await Actor.createActor(tokenIdlFactory,{
      agent,
      canisterId: Principal.fromText("tlwi3-3aaaa-aaaaa-aaapq-cai")
    });
    const sellerId = await opend.getOriginalOwner(props.id);
    const itemPrice = await opend.getPrice(props.id);
    const result = await tokenActor.transfer(sellerId,itemPrice);
    console.log(result);
    if(result=="Success") {
      const rp = opend.completePurchase(props.id,sellerId,CURRENT_USER_ID);
      console.log(rp);
    }
    setLoaderHidden(true);
    setShouldDisplay(false);
  };

  const sellItem = async () =>{ 
    setLoaderHidden(false);
    console.log(price);
    console.log(id.toString());
    const res = await opend.ListItem(id,Number(price));
    console.log("Listing "+ res);
    if(res=="Success") {
      NFTActor = await Actor.createActor(idlFactory,{
        agent,
        canisterId: id
      });
      const name = NFTActor.getName();
      console.log(name);
      const openDId  = await opend.getOpenDID();
      const response = await NFTActor.transferNFT(openDId);
      console.log("Transfer " +response);
      if(response=="Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setNFTOwner("OpenD");
        setBlur({filter:"blur(4px)"})
        setSellStatus("Listed")
      }
    }
    
  }

  const handleSell = () =>{
    console.log("Sell Clicked");
    setPriceInput(<input
      placeholder="Price in RETR"
      type="number"
      className="price-input"
      value={price}
      onChange={(e)=>{price=e.target.value}}
    />)
    setButton(<Button handleClick={sellItem} text="Confirm"/>)
  };



  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory,{
      agent,
      canisterId: id
    });
    const name = await NFTActor.getName();
    setNFTName(name);
    const owner = await NFTActor.getOwner();
    
    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent.buffer],{type:"image/png"}));
    
    setNFTAsset(image);
    const nftPrincipal = await NFTActor.getCanisterId();
    const nftIsListed = await opend.isListed(nftPrincipal);
    console.log("H"+nftIsListed);
    if(props.role=="collection") {
      if(nftIsListed==true) {
        console.log("Here");
        setNFTOwner("OpenD");
        setButton();
        setPriceInput();
        setBlur({filter: "blur(4px)"})
        setSellStatus("Listed")
      } else {
        setButton(<Button handleClick={handleSell} text="Sell"/>)
        setNFTOwner(owner.toString());
      }
    }
    else {
      const originalOwner = await opend.getOriginalOwner((props.id));
      const nftPrice = await opend.getPrice(nftPrincipal);
      console.log(nftPrice);
      setPriceLabel(<PriceLabel price={Number(nftPrice)}/>)
      if(originalOwner.toText()!=CURRENT_USER_ID.toText()) {
        console.log(originalOwner.toText());
        console.log(CURRENT_USER_ID.toText());
        const currOwner = await NFTActor.getOwner();
        console.log(currOwner.toText());
        console.log("Y");
        setButton(<Button handleClick={handleBuy} text="Buy"/>);
      }  
    }
    if(nftIsListed==true) {
      setNFTOwner("OpenD")
    } else {
      setNFTOwner(owner.toString());
    }
    
  }

  useEffect(()=>{
    loadNFT();
  },[])

  return (
    <div style={{display: shouldDisplay?"inline":"none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={nftAsset}
          style={blur}
        />
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
        {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {nftName}<span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {nftOwner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
