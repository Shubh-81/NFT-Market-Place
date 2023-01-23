import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
actor class NFT(name:Text,owner:Principal,content:[Nat8]) = this {
    
    let itemName = name;
    var nftOwner = owner;
    let imageBytes = content;

    public query func getName() : async Text {
        return itemName;
    };

    public query func getOwner() : async Principal {
        return nftOwner;
    };

    public query func getAsset() : async [Nat8] {
        return imageBytes;
    };

    public query func getCanisterId() : async Principal {
        return Principal.fromActor(this);
    };

    public shared(msg) func transferNFT(newOwner: Principal) : async Text {
        if(msg.caller == nftOwner) {
            nftOwner:= newOwner;
            return "Success"
        }
        else {
            return "Error : Not initiated by Owner";
        }
    };
}