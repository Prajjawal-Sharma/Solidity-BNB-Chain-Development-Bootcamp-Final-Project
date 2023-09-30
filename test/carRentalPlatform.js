const CarRentalPlatform=artifacts.require("CarRentalPlatform")
contract("CarRentalPlatform",accounts=>{
    let carRentalPlatform;
let owner=accounts[0];
let user1=accounts[1];
beforeEach(async()=>{
    carRentalPlatform=await CarRentalPlatform.new();
});
    describe("Add user and a car",()=>{
        it("adds a new user",async()=>{
            await carRentalPlatform.addUsers("John","Doe",{from:user1})
            const user=await carRentalPlatform.getUser(user1);
            assert.equal(user.name,"John","user name has problem")
            assert.equal(user.lastName,"Doe","last name has problem")
        })
        it("adds a new car",async()=>{
            await carRentalPlatform.addCars("Lamborghini","lambo_url",50,800000,{from:owner});
            const car=await carRentalPlatform.getCar(1);
            assert.equal(car.name,"Lamborghini","Car name has problem")
            assert.equal(car.imgUrl,"lambo_url","Car's image url has problem")
            assert.equal(car.rentFee,50,"Car's rental fee has problem")
            assert.equal(car.saleFee,800000,"Car's sales price has problem")
        })
    })
    describe("check in and checkout a car",()=>{
        it("check out a car",async()=>{
            await carRentalPlatform.addUsers("John","Doe",{from:user1})
            await carRentalPlatform.addCars("Lamborghini","lambo_url",50,800000,{from:owner});
            await carRentalPlatform.checkOutCar(1,{from:user1});
            const user=await carRentalPlatform.getUser(user1);
            assert.equal(user.rentedCarsId,1,"Could not checkout car")
        })
        it("check in a car",async()=>{
            await carRentalPlatform.addUsers("John","Doe",{from:user1})
            await carRentalPlatform.addCars("Lamborghini","lambo_url",50,800000,{from:owner})
            await carRentalPlatform.checkOutCar(1,{from:user1})
            await new Promise(resolve=>setTimeout(resolve,60000));
            await carRentalPlatform.checkInCar({from:user1})
            const user=await carRentalPlatform.getUser(user1)
            assert.equal(user.rentedCarsId,0,"Could not check in the car")
            assert.equal(user.debt,50,"User debt did not get created")
        })
    })
    describe("deposit token and make payment",()=>{
        it("deposit token",async()=>{
            await carRentalPlatform.addUsers("John","Doe",{from:user1})
            await carRentalPlatform.depositAmt({from:user1,value:100})
            const user=await carRentalPlatform.getUser(user1)
            assert.equal(user.balance,100,"Could not deposit token")

        })
        it("make payment",async()=>{
            await carRentalPlatform.addUsers("John","Doe",{from:user1})
            await carRentalPlatform.addCars("Lamborghini","lambo_url",50,800000,{from:owner})
            await carRentalPlatform.checkOutCar(1,{from:user1})
            await new Promise(resolve=>setTimeout(resolve,60000));
            await carRentalPlatform.checkInCar({from:user1})
            await carRentalPlatform.depositAmt({from:user1,value:100})
            await carRentalPlatform.makePayment({from:user1});
            const user=await carRentalPlatform.getUser(user1)
            assert.equal(user.debt,0,"Could not make payment!")

        })
    })
    describe("edit car",()=>{
        it("edit car metadata",async()=>{
            await carRentalPlatform.addCars("Lamborghini","lambo_url",50,800000,{from:owner})
            const editName="Buggati Chiron"
            const editUrl="buggati_url"
            const editRent=80
            const editSale=1000000
            await carRentalPlatform.editCarData(1,editName,editUrl,editRent,editSale,{from:owner})
            const car=await carRentalPlatform.getCar(1)
            assert.equal(car.name,editName,"There was trouble editing the car name!")
            assert.equal(car.imgUrl,editUrl,"There was trouble editing the car image url!")
            assert.equal(car.rentFee,editRent,"There was trouble editing the car rent!")
            assert.equal(car.saleFee,editSale,"There was trouble editing the car sale price!")
        })
        it("edit car status",async()=>{
            await carRentalPlatform.addCars("Lamborghini","lambo_url",50,800000,{from:owner})
            const editStatus=0;
            await carRentalPlatform.editCarStatus(1,editStatus,{from:owner})
            const car=await carRentalPlatform.getCar(1)
            assert.equal(car.status,editStatus,"Status not updated!");
        })
    })

    describe("Withdraw balance",()=>{
        it("send desired amount of tokens to user",async()=>{
            await carRentalPlatform.addUsers("John","Doe",{from:user1})
            await carRentalPlatform.depositAmt({from:user1,value:100})
            await carRentalPlatform.withdrawBalance(50,{from:user1})
            const user=await carRentalPlatform.getUser(user1)
            assert.equal(user.balance,50,"Could not withdraw desired amount from user")
        })
        it("send desired amount of tokens to owner",async()=>{
            await carRentalPlatform.addUsers("John","Doe",{from:user1})
            await carRentalPlatform.addCars("Lamborghini","lambo_url",50,800000,{from:owner})
            await carRentalPlatform.checkOutCar(1,{from:user1})
            await new Promise(resolve=>setTimeout(resolve,60000));
            await carRentalPlatform.checkInCar({from:user1})
            await carRentalPlatform.depositAmt({from:user1,value:1000})
            await carRentalPlatform.makePayment({from:user1});
            const totalPaymentAmount=await carRentalPlatform.getTotalPayment({from:owner})
            const amountToWithdraw=totalPaymentAmount-50;
            await carRentalPlatform.withdrawOwnerBalance(amountToWithdraw,{from:owner})
            const totalPayment=await carRentalPlatform.getTotalPayment({from:owner})
            assert.equal(totalPayment,50,"Could not withdraw tokens by the owner")
        })
    })
})