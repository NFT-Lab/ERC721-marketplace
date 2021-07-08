import hardhat from "hardhat";

async function faucet(to: string) {
  const signers = await hardhat.ethers.getSigners();
  const comparable = await Promise.all(
    signers.map(async (signer) => ({
      signer: signer,
      balance: await signer.getBalance(),
    }))
  );
  comparable.sort((a, b) => {
    const num = a.balance.sub(b.balance);
    if (num.isNegative()) return -1;
    else if (num.isZero()) return 0;
    return 1;
  });
  const tx = {
    to: to,
    value: hardhat.ethers.utils.parseEther("10"),
  };
  comparable[0].signer
    .sendTransaction(tx)
    .then((txResponse) => {
      console.log("faucet sent 10 ethers to " + to);
      console.log(txResponse);
    })
    .catch((error) => {
      console.log("something went wrong " + error);
    });
}

faucet("0x088c0Fb86f9C7d91a967E8A46F66Fb1a8C14dae8")
  .then(() => {
    console.log("done.");
  })
  .catch((error) => {
    console.log(error);
  });
