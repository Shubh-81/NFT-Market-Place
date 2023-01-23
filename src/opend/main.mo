import Principal "mo:base/Principal";
import NFTActorClass "../NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Iter "mo:base/Iter";

actor OpenD {

    private type Listing = {
        itemOwner: Principal;
        itemPrice: Nat;
    };

    var mapOfNFTs = HashMap.HashMap<Principal,NFTActorClass.NFT>(1,Principal.equal,Principal.hash);
    var mapOfOwner =  HashMap.HashMap<Principal,List.List<Principal>>(1,Principal.equal,Principal.hash);
    var mapOfListings = HashMap.HashMap<Principal,Listing>(1,Principal.equal,Principal.hash);
 
    public shared(msg) func mint(imageData: [Nat8],name: Text) : async Principal {
        let owner : Principal = msg.caller;
        Debug.print(debug_show(owner));
        Debug.print(debug_show(Cycles.balance()));
        Cycles.add(100_500_000_000);
        let newNFT = await NFTActorClass.NFT(name,owner,imageData);
        Debug.print(debug_show(Cycles.balance()));
        let newNFTPrincipal = await newNFT.getCanisterId();
        mapOfNFTs.put(newNFTPrincipal,newNFT);
        addToOwner(owner,newNFTPrincipal);
        return newNFTPrincipal;
    };

    private func addToOwner(owner: Principal,nftId: Principal) {
        var ownedNFTs : List.List<Principal> = switch(mapOfOwner.get(owner)){
            case null List.nil<Principal>();
            case (?result) result;
        };

        ownedNFTs:=List.push(nftId,ownedNFTs);
        mapOfOwner.put(owner,ownedNFTs);

    };

    public query func getOwnedNFTs(user: Principal) : async [Principal] {
        var ownedNFTs : List.List<Principal> = switch(mapOfOwner.get(user)){
            case null List.nil<Principal>();
            case (?result) result;
        };
        return List.toArray(ownedNFTs);
    };

    public shared(msg) func ListItem(id:Principal,price: Nat) : async Text {
        var item: NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
            case null return "NFT does not exsist";
            case (?result) result;
        };
        let owner = await item.getOwner();
        if(Principal.equal(owner,msg.caller)) {
            let newListing : Listing = {
                itemOwner: Principal =  owner;
                itemPrice: Nat = price;
            };
            mapOfListings.put(id,newListing);
            return "Success";
        } else {
            return "You don't own the NFT";
        };
    };

    public query func getOpenDID() : async Principal {
        return Principal.fromActor(OpenD);
    };

    public query func isListed(id: Principal) : async Bool {
        if(mapOfListings.get(id) == null)   {return false;}
        else    {return true;}
    };

    public query func getListed() : async [Principal] {
        let ids = Iter.toArray(mapOfListings.keys());
        return ids;
    };

    public query func getOriginalOwner(id: Principal) : async Principal {
        var listItem = switch(mapOfListings.get(id)) {
            case null return Principal.fromText("");
            case (?result) result
        };
        return listItem.itemOwner;
    };

    public query func getPrice(id: Principal) : async Nat {
        var listItem = switch(mapOfListings.get(id)) {
            case null return 0;
            case (?result) result
        };
        return listItem.itemPrice;
    };

    public shared(msg) func completePurchase(id:Principal,ownerId:Principal,newOwnerId: Principal) : async Text {
        var purchasedNFT : NFTActorClass.NFT = switch(mapOfNFTs.get(id)) {
            case null return "NFT does not exsist";
            case (?result) result
        };
        let transferResult = await purchasedNFT.transferNFT(newOwnerId);
        if(transferResult=="Success") {
            mapOfListings.delete(id);
            var ownedNFTs: List.List<Principal> = switch (mapOfOwner.get(ownerId)) {
                case null List.nil<Principal>();
                case (?result) result
            };
            ownedNFTs := List.filter(ownedNFTs,func(listItemId: Principal) : Bool {
                return listItemId!= id;
            });
            addToOwner(newOwnerId,id);
            return "Success";
        } else {
            return "Error"; 
        }
        
    };
};
