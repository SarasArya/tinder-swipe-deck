import React , { Component } from 'react';
import { View, Animated, PanResponder, Dimensions, LayoutAnimation, UIManager } from 'react-native'; 

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;
class Deck extends Component {
    static defaultProps = {
        onSwipeRight : () => {},
        onSwipeLeft : () => {}
    }
  constructor(props) {
    super(props);
    const position = new Animated.ValueXY();
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        if (gesture) {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        }
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          console.log("SWIPE_RIGHT");
          this.forceSwipe(SCREEN_WIDTH);
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          console.log("SWIPE_LEFT");
          this.forceSwipe(-SCREEN_WIDTH);
        } else {
          console.log("RESET_POSITION");
          this.resetPosition();
        }
      }
    });
    this.position = position;
    this.state = { index : 0 };

  }
  resetPosition() {
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.data !== this.props.data){
        this.setState({index : 0})
    }
  }

  componentWillUpdate(){
    UIManager.setLayoutAnimationEnabledExperimental && UI.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  forceSwipe(screen_width) {
    Animated.timing(this.position, {
      toValue: { x: screen_width * 1.3, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(screen_width));
  }

  onSwipeComplete(direction){
      const  { onSwipeLeft, onSwipeRight, data } = this.props; 
      const item = data[this.state.index];
    direction < 0 ? onSwipeLeft(item) : onSwipeRight(item);
    this.position.setValue({ x: 0, y: 0 });
    this.setState({index : this.state.index + 1});
    
  }
  getCardStyle() {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"]
    });

    return { ...this.position.getLayout(), transform: [{ rotate }] };
  }
  renderCards() {
    if(this.state.index >= this.props.data.length){
        return this.props.renderNoMoreCards();
    }
    return this.props.data.map((item, index) => {
      if(index  < this.state.index ){
          return null;
      }
      else if (index === this.state.index) {
        return <Animated.View key={item.id} style={[this.getCardStyle(), styles.cardStyle]} {...this.panResponder.panHandlers}>
            {this.props.renderCard(item)}
          </Animated.View>;
      }else{
        return <Animated.View key={item.id} style={[styles.cardStyle, {top : 10 * (index - this.state.index)}]}>{this.props.renderCard(item)}</Animated.View>;
      }
    }).reverse();
  }
  
  render() {
    // {...this.panResponder.panHandlers}

    return <View>{this.renderCards()}</View>;
  }
};

const styles = {
    cardStyle : {
        position : 'absolute',
        width : SCREEN_WIDTH
    }
}

export default Deck;