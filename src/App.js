import React from 'react';
import './App.css';

class BookSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      word: '',
      sort: 'sales',
      result: [],
      startSearchFlag: false,
      itemDetails: {},
      selectedItem: '',
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.handleShow = this.handleShow.bind(this);
  }
  fetchData(callback) {
    const params = '?'
      + 'formatVersion=2'
      + '&applicationId=10cb3e01455a16aef15a3381f015fdab'
      + `&sort=${this.state.sort}`
      + `&keyword=${this.state.word}`;

    fetch(`https://app.rakuten.co.jp/services/api/BooksTotal/Search/20130522${params}`, {
      method: 'get',
    }).then((response) => {
      if (response.status === 200) {
        return response.json();
      }
      return console.log(response);
    }).then(
      response => callback(response.Items),
    ).catch(
      response => console.log(response),
    );
  }
  setFetchedData(obj = {}) {
    return this.setState(
      obj,
      () => this.fetchData(
        apiResult => this.setState({
          result: apiResult,
          startSearchFlag: true,
        }),
      ),
    );
  }
  handleInput(e) {
    const newValue = e.target.value;
    return this.setState({ word: newValue });
  }
  handleClick() {
    if (this.state.word !== '') {
      return this.setState({
        selectedItem: '',
        itemDetails: {},
      }, this.setFetchedData());
    }
    return false;
  }
  handleSort(e) {
    const newSort = e.target.value;
    if (this.state.word !== '' && newSort !== this.state.sort) {
      return this.setFetchedData({ sort: newSort });
    }
    return false;
  }
  handleShow(item) {
    return this.setState({
      itemDetails: item,
      selectedItem: item.itemUrl,
    });
  }
  render() {
    return (
      <div>
        <BookSearchHeader
          word={this.state.word}
          handleInput={this.handleInput}
          handleClick={this.handleClick}
        />
        <BookSearchResult
          word={this.state.word}
          result={this.state.result}
          startSearchFlag={this.state.startSearchFlag}
          sort={this.state.sort}
          selectedItem={this.state.selectedItem}
          handleSort={this.handleSort}
          handleShow={this.handleShow}
        />
        <BookSearchDetails item={this.state.itemDetails} />
      </div>
    );
  }
}

const BookSearchHeader = (props) => {
  return (
    <header>
      <h1>BookSearch! <span>by 楽天ブックス</span></h1>
      <BookSearchFormInput
        word={props.word}
        handleInput={props.handleInput}
      />
      <BookSearchFormButton handleClick={props.handleClick} />
    </header>
  );
};

const BookSearchFormInput = (props) => {
  return (
    <input type="text" placeholder="キーワード" value={props.word} onChange={props.handleInput} />
  );
};

const BookSearchFormButton = (props) => {
  return (
    <button onClick={props.handleClick}>検索</button>
  );
};

const BookSearchResult = (props) => {
  const displayRadioButton = () => {
    if (props.result.length !== 0) {
      return <BookSearchFormRadio handleSort={props.handleSort} sort={props.sort} />;
    }
    return false;
  };
  const displayItemNodes = () => {
    if (props.result.length === 0 && props.startSearchFlag !== false) {
      return <p className="nonMessage">お探しの書籍はありませんでした</p>;
    } else if (props.startSearchFlag !== false) {
      return props.result.map(item => (
        <BookSearchItem
          item={item}
          key={item.itemUrl}
          selectedItem={props.selectedItem}
          handleShow={props.handleShow}
        />
      ));
    }
    return false;
  };
  return (
    <div className="item-list">
      {displayRadioButton()}
      <div>{displayItemNodes()}</div>
    </div>
  );
};

const BookSearchFormRadio = (props) => {
  return (
    <div>
      <label htmlFor="sales">
        <input
          id="sales"
          type="radio" name="sort" value="sales"
          checked={props.sort === 'sales'}
          onChange={props.handleSort}
        /> 売れている順
      </label>
      <label htmlFor="releaseDate">
        <input
          id="releaseDate"
          type="radio" name="sort" value="-releaseDate"
          checked={props.sort === '-releaseDate'}
          onChange={props.handleSort}
        /> 発売順
      </label>
    </div>
  );
};

const BookSearchItem = (props) => {
  const handleShow = () => props.handleShow(props.item);
  const selected = (props.selectedItem === props.item.itemUrl) ? 'item selected' : 'item';
  return (
    <div onClick={handleShow} className={selected}>
      <figure>
        <img src={props.item.smallImageUrl} alt={props.item.title} />
      </figure>
      <p>{props.item.title}</p>
    </div>
  );
};

const BookSearchDetails = (props) => {
  const style = {
    color: '#e53935',
    fontSize: '18px',
    fontWeight: 'bold',
  }
  const item = props.item;
  const displayItemDetails = () => {
    if (Object.keys(item).length !== 0) {
      return (
        <div>
          <ul className="details-list">
            <li>
              <a href={item.itemUrl} target="_blank" rel="noopener noreferrer">
                <img src={item.largeImageUrl} alt={item.title} />
              </a>
            </li>
            <li><strong style={{ fontSize: '18px' }}>{item.title}</strong></li>
            <li>著者: {item.author}</li>
            <li>出版社: {item.publisherName}</li>
            <li>発売日: {item.salesDate}</li>
            <li>ISBN: {item.isbn}</li>
            <li>評価: {item.reviewAverage}</li>
            <li>価格: <span style={style}>{item.itemPrice}円</span></li>
            <li>{item.itemCaption}</li>
            <li className="details-link">
              <a href={item.itemUrl} target="_blank" rel="noopener noreferrer">
                購入する
              </a>
            </li>
          </ul>
        </div>
      );
    }
    return false;
  };
  return (
    <div className="item-details">
      { displayItemDetails() }
    </div>
  );
};

export default BookSearch;
