
const ActionTypes = {
  INIT: "@@redux/INIT",
};

const compose = (...middlewares) => middlewares.reduce((a, b) => (...args) => a(b(...args)))

const applyMiddleware = (...middlewares) => {
  return createStore => {
    return (...args) => {
      const store = createStore(...args);

      let _dispatch = function () {
        throw new Error('请不要在构建中间件时进行调用')
      }
      const middlewareApi = {
        getState: store.getState,
        dispatch(..._args) {
          return _dispatch(..._args);
        }
      }
      const chain = middlewares.map(middleware => middleware(middlewareApi));
      _dispatch = compose(...chain)(store.dispatch);
      return {
        ...store,
        dispatch: _dispatch
      }
    }
  }
}

const createStore = (reducer, initState, enhancer) => {

  if (enhancer) {
    return enhancer(createStore)(reducer, initState);
  }

  let state = initState;
  let listeners = [];

  const dispatch = (action) => {
    state = reducer(state, action);

    listeners.forEach(listener => {
      listener();
    });
    return action;
  }

  const subscribe = (listener) => {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    }
  }

  const getState = () => state;
  
  dispatch({
    type: ActionTypes.INIT
  });

  return {
    dispatch,
    getState,
    subscribe
  }
}


function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};

  // 将值不为 function 的 reducer 过滤掉
  for (const key of reducerKeys) {
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }

  var finalReducerKeys = Object.keys(finalReducers);

  return function combination(state, action) {
    if (state === void 0) {
      state = {};
    }

    var hasChanged = false;
    var nextState = {};

    for (const _key of finalReducerKeys) {
      const reducer = finalReducers[_key];
      const preStateForKey = state[_key];
      const nextStateForKey = reducer(preStateForKey, action);

      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== preStateForKey;
    }
    return hasChanged ? nextState : state;
  }
}

export { 
  createStore, 
  combineReducers, 
  // bindActionCreators, 
  applyMiddleware, 
  compose, 
}
