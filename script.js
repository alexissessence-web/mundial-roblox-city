document.addEventListener("DOMContentLoaded",()=>{

const form=document.getElementById("registro");

if(form){

form.addEventListener("submit",(e)=>{

e.preventDefault();

let numero=Math.floor(
10000+Math.random()*90000
);

let folio="MRC26-"+numero;

localStorage.setItem(folio,"En revisión");

document.getElementById("folio").innerHTML=
"✅ Tu folio es: <b>"+folio+"</b>";

});

}

});
