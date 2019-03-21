import React from 'react';
import PropTypes from 'prop-types';

const ReduxContext = React.createContext();

const ReduxConsumer = ReduxContext.Consumer;

const connect = (mapStateToProps, mapDispatchToProps) => {
  return Component => {
    return class extends React.Component {
      getProps = store => {
        const preProps = this.props;
        const storeState = store.getState();
        const dispatch = store.dispatch;

        let nextProps = {
          ...preProps,
          dispatch
        }
        if (typeof mapStateToProps === 'function') {
          nextProps = {
            ...nextProps,
            ...mapStateToProps(storeState, nextProps),
          }
        }
        if (typeof mapDispatchToProps === 'function') {
          nextProps = {
            ...nextProps,
            ...mapDispatchToProps(dispatch, nextProps),
          }
        }
        return nextProps;
      }
      render() {
        return (
          <ReduxConsumer >
            {
              ({ store }) => <Component {...this.getProps(store)} />
            }
          </ReduxConsumer>
        )
      }
    }
  }
}


class Provider extends React.Component {
  state = {
    store: null,
    storeState: null
  }

  static getDerivedStateFromProps(props, state) {
    if (state.storeState !== props.storeState) {
      const store = props.store;
      return {
        store,
        storeState: store.getState()
      }
    }
  }

  subscribe() {
    const store = this.props.store;
    this.unsubscribe = store.subscribe(() => {
      if (!this._isMounted) {
        return;
      }

      const newState = store.getState();
      
      this.setState(preState => {
        if (newState === preState) {
          return null;
        }
        return {
          storeState: newState
        }
      })
    })
    const nextState = store.getState();
    this.setState({
      storeState: nextState
    })
  }
  componentDidMount() {
    this.subscribe();
    this._isMounted = true;
  }
  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
    this._isMounted = false;
  }
  componentDidUpdate(preProps) {
    if (this.props.store !== preProps.store) {
      this.unsubscribe && this.unsubscribe();
      this.subscribe();
    }
  }
  render() {
    const Context = this.props.context || ReduxContext;
    return React.createElement(Context.Provider, {
      value: this.state
    }, this.props.children);
  }
}

Provider.propTypes = {
  store: PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  }),
  context: PropTypes.object,
  children: PropTypes.any
};

export {
  connect,
  Provider
}
