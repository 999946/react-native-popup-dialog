/* @flow */

import React, { Component } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Overlay from './Overlay';
import DefaultAnimation from '../animations/DefaultAnimation';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

type Props = {
  width: number;
  height: number;
  haveOverlay: bool;
  overlayPointerEvents: string;
  overlayBackgroundColor: string;
  overlayOpacity: number;
  popupAnimation: Object;
  containerStyle: Object | number;
  cententStyle: Object | number;
  animationDuration: number;
  closeOnTouchOutside: bool;
  open: bool;
  onOpened: Function;
  onClosed: Function;
  children: any;
};

const defaultProps = {
  animationDuration: 200,
  popupAnimation: new DefaultAnimation({ animationDuration: 150 }),
  width: WIDTH,
  height: 300,
  closeOnTouchOutside: true,
  haveOverlay: true,
};

class Popup extends Component {
  props: Props;
  static defaultProps = defaultProps;

  constructor(props) {
    super(props);
    // opened, opening, closed, closing,
    this.state = {
      popupState: 'closed',
    };

    this.onOverlayPress = this.onOverlayPress.bind(this);
  }

  componentDidMount() {
    if (this.props.open) {
      this.open(this.props.onOpened);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open) {
      if (nextProps.open) {
        return this.open(nextProps.onOpened);
      }
      return this.close(nextProps.onClosed);
    }
    return nextProps;
  }

  onOverlayPress() {
    if (this.props.closeOnTouchOutside) {
      this.close();
    }
  }

  setpopupState(toValue, callback) {
    this.props.popupAnimation.toValue(toValue);
    let popupState = toValue ? 'opening' : 'closing';

    this.setState({ popupState });

    setTimeout(() => {
      popupState = popupState === 'closing' ? 'closed' : 'opened';
      this.setState({ popupState });
      if (callback && typeof callback === 'function') callback();
    }, this.props.animationDuration);
  }

  calculateDialogSize({ width, height }): Object {
    const size = { width, height };
    if (width > 0.0 && width < 1.0) {
      size.width = width * WIDTH;
    }
    if (height > 0.0 && height < 1.0) {
      size.height = height * HEIGHT;
    }
    return size;
  }

  open(onOpened = this.props.onOpened) {
    this.setpopupState(1, onOpened);
  }

  close(onClosed = this.props.onClosed) {
    this.setpopupState(0, onClosed);
  }

  get pointerEvents() {
    if (this.props.overlayPointerEvents) {
      return this.props.overlayPointerEvents;
    }
    return this.state.popupState === 'opened' ? 'auto' : 'none';
  }

  render() {
    let hidden;
    let centent;

    const popupState = this.state.popupState;
    const overlayPointerEvents = this.pointerEvents;
    const isShowOverlay = (['opened', 'opening'].includes(popupState) && this.props.haveOverlay);

    if (popupState === 'closed') {
      hidden = styles.hidden;
    } else {
      const size = this.calculateDialogSize(this.props);
      centent = (
        <Animated.View
          style={[
            styles.centent, size, this.props.cententStyle, this.props.popupAnimation.animations,
          ]}
        >
          {this.props.children}
        </Animated.View>
      );
    }

    return (
      <View style={[styles.container, this.props.containerStyle, hidden]}>
        <Overlay
          pointerEvents={overlayPointerEvents}
          showOverlay={isShowOverlay}
          onPress={this.onOverlayPress}
          backgroundColor={this.props.overlayBackgroundColor}
          opacity={this.props.overlayOpacity}
          animationDuration={this.props.animationDuration}
        />
        {centent}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: WIDTH,
    height: HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centent: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  hidden: {
    top: -10000,
    left: 0,
    height: 0,
    width: 0,
  },
});

export default Popup;
