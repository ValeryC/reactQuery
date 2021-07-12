import React, { useState, useEffect } from "react";
import axios from "axios";
import { withRouter, useHistory } from "react-router-dom";
import FormStep from "./formStep";
import CustomizationsStepsWrap from "./customizationsStepsWrap";
import Input from "../../components/input/input";
import ArticleDropdownColor from "../../components/articleDropdown/articleDropdownColor";
import ArticleDropdown from "../../components/articleDropdown/articleDropdown";
import StoreDropdown from "../../components/storeDropdown/storeDropdown";
import SizeDropdown from "../../components/sizeDropdown/sizeDropdown";
import ColorDropdownV2 from "../../components/colorDropdown/colorDropdownV2";
import SelectedArticle from "../../components/selectedArticle/selectedArticle";
import { api_url } from "../../utils";
import Signature from "../../components/signature/signature";
import Checkbox from "../../components/checkbox/checkbox";
import "./form.css";
import i18n from "../../translations/i18n";
// one hunk
const Form = (props) => {

  let history = useHistory();
  const [activeStep, setActiveStep] = useState(1)
  const [customization, setCustomization] = useState(1)
  const [stateName, setStateName] = useState("");

  //FIRST STEP
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [cityZip, setCityZip] = useState("")
  const [email, setEmail] = useState("")
  const [emailErr, setEmailErr] = useState("")
  const [valCustomisation, setValCustomisation] = useState("")


  //  Custom shoes Left
  const [initial_Left_upper, setInitial_Left_upper] = useState("")
  const [initial_Left_upper2, setInitial_Left_upper2] = useState("")
  const [initial_Left_shank, setInitial_Left_shank] = useState("")


  //  Custom shoes_right
  const [initial_Right_upper, setInitial_Right_upper] = useState("")
  const [initial_Right_upper2, setInitial_Right_upper2] = useState("")
  const [initial_Right_shank, setInitial_Right_shank] = useState("")


  const [selectedStore, setSelectedStore] = useState("")
  const [selectedStoreI, setSelectedStoreI] = useState("")
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedArticleI, setSelectedArticleI] = useState("")
  const [selectedArticleII, setSelectedArticleII] = useState("")

  const [photo, setPhoto] = useState("")

  const [DropColorI, setDropColorI] = useState(null)
  const [selectedArticleDropColor, setSelectedArticleDropColor] = useState("")
  const [selectedArticleColor, setSelectedArticleColor] = useState("")
  const [selectedArticleSize, setSelectedArticleSize] = useState("")
  const [selectedSKU, setSelectedSKU] = useState("")
  const [rawArticle, setRawArticle] = useState([])
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [signature, setSignature] = useState(false);
  const [signatureImg, setSignatureImg] = useState(null);
  const [error, setError] = useState("")


  const [selectedShoes, setSelectedShoes] = useState("")
  //REQUEST PARAMS
  const [clientId, setClientId] = useState("")
  const [customizationId, setCustomizationId] = useState("")

  const [articleData, setArticleData] = useState([])
  const [storeData, setStoreData] = useState([])

  const submitHandler = step => {
    const token = localStorage.getItem("beltoken");

    setError("")
    setEmailErr("")

    // validation for select in first step
    if (!selectedStore) {
      setError("Select a Store")
      return;
    }


    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    if (email.length === 0) {
      setEmailErr("Need an email")
      return;
    }
    else if (!validateEmail(email)) {
      setEmailErr("Doesnt look like email")
      return;
    }

    if (step === 2 && (!selectedArticleI || !selectedArticleSize)) {
      setError("Complete all the fields")
      return;
    }
      // validation for step three
      if (step === 3 && (!signature || !agreeTerms)) {
        setError( "Please agree" );
        return;
      }

    let url = "";
    let data = {};
    let stateName = "";
    let currentStep = "";

    let headers = {
      'Content-Type': 'application/json',
    }

    if (step === 1) {

      url = "resources/clients/";
      data = {
        client_name: name,
        client_address_street_name: address,
        client_address_city_zipcode: cityZip,
        client_email: email
      };
      stateName = "clientId";
      currentStep = step;

    }
    else if (step === 2) {

      url = "resources/customs/";
      data = {
        custom_name: valCustomisation,
        custom_birthdate: "",
        custom_upper_left_left: initial_Left_upper.toUpperCase(),
        custom_upper_left_right: initial_Left_upper2.toUpperCase(),
        custom_shank_left: initial_Left_shank.toUpperCase(),

        custom_upper_right_left: mark,
        custom_upper_right_right: initial_Right_upper2.toUpperCase(),
        custom_shank_right: initial_Right_shank.toUpperCase(),

        custom_color: selectedArticleDropColor,
        custom_font_size: selectedArticleSize,
      };

      stateName = "customizationId";
      currentStep = step;

    } else if (step === 3) {
      url = "resources/orders/";

      function dataURLtoFile(dataurl, filename) {

        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      }

      let image = dataURLtoFile(signatureImg, 'a.png');

      const lang = localStorage.getItem("belLan");
      const article = rawArticle.find(item => item.article_ref_rku === selectedSKU);

      data = new FormData();
      data.append("order_signature", image);
      data.set("order_article", article.id)
      data.set("order_custom", customizationId)
      data.set("order_client", clientId)
      data.set("order_language", lang)

      stateName = "orderId";
      currentStep = step;
      headers["Content-type"] = 'application/json';
    }

    axios({
      method: "post",
      url: api_url + url,
      headers,
      data
    })
      .then(res => {

        setStateName([res.data.id])
        setActiveStep(currentStep + 1)
        setError("")
        let custom_id = res.data.id

        if (res.status == 201) {

          if (step === 1 ) {
            setClientId(res.data.id)
          }
          else if (step === 2 ) {
            setCustomizationId(res.data.id)
          }
        }
      })
      .catch(err => {
        setError("Please check did you fill all the required fields")
        console.log("err", err);
      });
  };


  const getArticles = () => {
    const token = localStorage.getItem('beltoken');
    axios({
      method: "get",
      url: `${api_url}resources/stores/`,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        setStoreData(res.data);
      })
      .catch(err => {
        console.log("err in geting articles", err);
      });
  };

  const selectStore = i => {
    const lang = localStorage.getItem("belLan");
    const res = storeData[i].store_articles.reduce(function (accumulator, current, id) {
      if (accumulator[current["article_name_" + lang]]) {
        accumulator[current["article_name_" + lang]].push(
          {
            name: current['article_name_en'],
            color: current['article_colors_en'][0],
            sku: current['article_ref_rku'],
            font_color: current['article_font_colors'],
            font_size: current['article_font_sizes'],
            photo: current['article_photo'],
          }
        )
      } else {
        accumulator[current["article_name_" + lang]] = [
          {
            name: current['article_name_en'],
            color: current['article_colors_en'][0],
            sku: current['article_ref_rku'],
            font_color: current['article_font_colors'],
            font_size: current['article_font_sizes'],
            photo: current['article_photo'],
          }
        ]
      }
      return accumulator;
    }, [])

    let articleArray = [];
    // Use this to create an array of article, { article_name: toto, data : {}}
    for (const [key, value] of Object.entries(res)) {
      articleArray.push({ "article_name": key, data: value })
    }

    setSelectedStore(storeData[i])
    setSelectedStoreI(i)
    setRawArticle(storeData[i].store_articles)
    setArticleData(articleArray)
    setSelectedArticleI("")
    setSelectedArticleDropColor("")
    setSelectedArticleColor("")
    setSelectedArticleSize("")
  };

  const selectArticle = i => {
    setSelectedArticle(articleData[i])
    setSelectedArticleI(i)
    setSelectedArticleDropColor("")
    setSelectedArticleColor("")
    setSelectedArticleSize("")
  };

  const selectArticle2 = i => {
    setSelectedShoes(articleData[i])
    setSelectedArticleII(i)
    setSelectedArticleDropColor("")
  };

  const selectArticleDropColor = i => {
    const id = selectedArticle.data.findIndex(item => item.color === i);
    setSelectedSKU(selectedArticle.data[id].sku)
    setSelectedArticleDropColor(selectedArticle.data[id].color)
    setDropColorI(id)
  };

  const selectColor = val => {
    setSelectedArticle(articleData[val])
    setSelectedArticleI(articleData[val].article_colors)
  }

  const selectSize = val => {
    setSelectedArticleSize(val)
  }

  const resetFormToHome = () => {
    window.location.href = '/'
  }

  const inputChangedHandler = (type, value) => {
    switch (type) {
      case 'name':
        setName(value)
        break;
      case 'address':
        setAddress(value)
        break;
      case 'cityZip':
        setCityZip(value)
        break;
      case 'email':
        setEmail(value)
        break;
      case 'initial_Left_upper':
        setInitial_Left_upper(value)
        console.log(setInitial_Left_upper(value));
        break;

      case 'initial_Left_upper2':
        setInitial_Left_upper2(value)
        console.log(setInitial_Left_upper2(value));
        break;

      case 'initial_Left_shank':
        setInitial_Left_shank(value)
        console.log(setInitial_Left_shank(value));
        break;

      case 'initial_Right_upper':
        setInitial_Right_upper("BALENCIAGA")
        console.log(setInitial_Right_upper(value));
        break;

      case 'initial_Right_upper2':
        setInitial_Right_upper2(value)
        console.log(setInitial_Right_upper2(value));
        break;
      case 'initial_Right_shank':
        setInitial_Right_shank(value)
        console.log(setInitial_Right_shank(value));
        break;
    }
    [type] = value

  };

  useEffect(() => {
    getArticles();
    document.title = "Balenciaga Customization";
  }, [])
  const previewLU = initial_Left_upper.toUpperCase()
  const previewLU2 = initial_Left_upper2.toUpperCase()
  const previewLS = initial_Left_shank.toUpperCase()

  const previewRU = initial_Right_upper.toUpperCase()
  // value of new right upper
  const mark = "Balenciaga".toUpperCase()

  const previewRU2 = initial_Right_upper2.toUpperCase()
  const previewRS = initial_Right_shank.toUpperCase()

  const article = rawArticle.find(item => item.article_ref_rku === selectedSKU)
  console.log(article);

  console.log(rawArticle);
  console.log(rawArticle.find(item => item.article_ref_rku ));
  console.log(rawArticle.find(item => item.article_ref_rku===selectedSKU))

  console.log(selectedSKU)
  
  
  return (
    <div className="formWrap">
      <FormStep
        title={i18n.t("information")}
        isActiveStep={activeStep === 1}
        activeStep={activeStep}
        step={"3"}
        labelButton={i18n.t("confirm")}
        goNextStep={() => submitHandler(1)}
        resetForm={() => resetFormToHome()}
      >
        <div className="info_inputs" >
          <Input
            placeholder={i18n.t("firstname")}
            value={name}
            onChange={e => inputChangedHandler("name", e.target.value)}
            error={error}
          />
          <Input
            placeholder={i18n.t("streetNumAndAddress")}
            value={address}
            onChange={e =>
              inputChangedHandler("address", e.target.value)
            }
            error={error}
          />
          <Input
            placeholder={i18n.t("cityZip")}
            value={cityZip}
            onChange={e =>
              inputChangedHandler("cityZip", e.target.value)
            }
            error={error}
          />
          <Input
            placeholder={i18n.t("email")}
            type="email"
            value={email.trim()}
            onChange={e => inputChangedHandler("email", e.target.value)}
            error={error}
            emailErr={emailErr}
          />
          <p className="error">{emailErr}</p>

          <StoreDropdown
            storeData={storeData}
            selected={selectedStore}
            value={selectedStoreI}
            onChange={e => selectStore(e.target.value)}
            error={error}
          />
          <p className="error">{error}</p>

        </div>
      </FormStep>

      <FormStep
        title={i18n.t("customization")}
        isActiveStep={activeStep === 2}
        activeStep={activeStep}
        step={"3"}
        labelButton={i18n.t("confirm")}
        goNextStep={() => submitHandler(2)}
        resetForm={() => resetFormToHome()}
        goBack={() => setActiveStep(activeStep - 1)}
      >
        <div className="customization" >
          <CustomizationsStepsWrap noStep>
            {selectedStore &&
    <ArticleDropdown
    selectedItem={selectedStoreI}
    articleData={articleData}
    selected={selectedArticle}
    value={selectedArticleI}
    onChange={e => selectArticle(e.target.value)}
    error={error}
  />
            }
            {selectedArticleI &&
     <ArticleDropdownColor
     selectedItem={selectedArticle}
     articleData={articleData}
     selected={selectedArticleDropColor}
     value={selectedArticleDropColor}
     selectedSKU={selectedSKU}
     onChange={e =>(selectArticleDropColor(e.target.value))
     }
     error={error}
   />
            }
            {selectedArticleDropColor && selectedArticleI &&
    <SizeDropdown
    selectedItem={selectedArticle}
    selectedColor={DropColorI}
    selected={selectedArticleSize}
    value={selectedArticleSize}
    onChange={e => selectSize(e.target.value)}
    error={error}
  />
            }
            {selectedArticleSize && selectedArticleI && selectedArticleDropColor &&
              <>
                <p>LEFT SHOE</p>
                <Input
                  type="text"
                  placeholder="SHANK"
                  onChange={e => inputChangedHandler(
                    "initial_Left_shank",
                    e.target.value.replace(/[^A-Za-z]/ig, '')
                  )}
                  value={previewLS
                  }
                  maxLength="8"
                  minLength="1"
                  error={error}
                />
                <Input
                  type="text"
                  placeholder="1. UPPER"
                  onChange={e => inputChangedHandler(
                    "initial_Left_upper",
                    e.target.value.replace(/[^A-Za-z]/ig, '')
                  )}
                  value={previewLU
                  }
                  maxLength="11"
                  minLength="1"
                  error={error}
                />
                <Input
                  type="text"
                  placeholder="2. UPPER"
                  onChange={e => inputChangedHandler(
                    "initial_Left_upper2",
                    e.target.value.replace(/[^A-Za-z]/ig, '')
                  )}
                  value={previewLU2
                  }
                  maxLength="11"
                  minLength="1"
                  error={error}
                />
                <p>RIGHT SHOE</p>
                <Input
                  type="text"
                  placeholder="SHANK"
                  onChange={e => inputChangedHandler(
                    "initial_Right_shank",
                    e.target.value.replace(/[^A-Za-z]/ig, '')
                  )}
                  value={previewRS
                  }
                  maxLength="8"
                  minLength="1"
                  error={error}
                />
                <Input
                  type="text"
                  // placeholder="UPPER"
                  value={mark}
                  error={error}
                />
                <Input
                  type="text"
                  placeholder="2. UPPER"
                  onChange={e => inputChangedHandler(
                    "initial_Right_upper2",
                    e.target.value.replace(/[^A-Za-z]/ig, '')
                  )}
                  value={previewRU2
                  }
                  maxLength="11"
                  minLength="1"
                  error={error}
                />
              </>
            }
          </CustomizationsStepsWrap>
        </div>
      </FormStep>
        <div className="summary">
        <FormStep
        title={i18n.t("summary")}
        isActiveStep={activeStep === 3}
        activeStep={activeStep}
        step={"3"}
        goNextStep={() => submitHandler(3)}
        labelButton={i18n.t("confirm")}
        resetForm={() => resetFormToHome()}
        goBack={() => setActiveStep(activeStep - 1)}
        large
      >
        {(selectedArticle && selectedSKU) ? (
          <SelectedArticle
            selectedArticle={rawArticle}
            selectedSKU={selectedSKU}
            colorCustomization={selectedArticleDropColor}
            initialCustomizationLU={previewLU}
            initialCustomizationLU2={previewLU2}
            initialCustomizationLS={previewLS}
            initialCustomizationRU={mark}
            initialCustomizationRU2={previewRU2}
            initialCustomizationRS={previewRS}
            sizeCustomization={selectedArticleSize}
            customization={i18n.t("customization")}
          />
          ) : null}
          <Checkbox
            label={i18n.t("agreeToTheTerms")}
            checked={agreeTerms}
            onChange={() => agreeTerms ? (setAgreeTerms(false)) : (setAgreeTerms(true))}
            error={error}
          />
          <Signature
            label={i18n.t("signHere")}
            signature={signature}
            signatureImg={(newImg) => setSignatureImg(newImg)}
            signed={() => setSignature(true)}
            error={error}
            clear={() => (setSignature(false), setSignatureImg(null))}
          />
      </FormStep>
        </div>
      <FormStep
        orderCompleted
        isActiveStep={activeStep === 4}
        activeStep={activeStep}
        resetForm={() => resetFormToHome()}
      >
        <h3 style={{ textAlign: "center" }}>
          {i18n.t("congratulations")}
          <br />
          {i18n.t("yourOrderWill")}
        </h3>
      </FormStep>
    </div>
  );

}

export default withRouter(Form);
