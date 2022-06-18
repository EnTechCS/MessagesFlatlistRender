import React, {useCallback, useRef, useMemo} from 'react';
import {View, FlatList, Text, StyleSheet} from 'react-native';
import {Tabs} from 'react-native-collapsible-tab-view';
import {useStore} from '../../global/gloablProvider';
import {useSocket} from '../../realTime/socketContextProvider';
import {useChatStore} from '../store/chatStoreProvider';
import MessageEach from './messages';
import {nothingToFind} from '../../nothingToFind/nothingToFind';
import {sendFirstRoomMessage} from '../store/storeHelper';

const _viewabilityConfig = {
  itemVisiblePercentThreshold: 50,
};

const NO_WIDTH_SPACE = '​';

const styles = StyleSheet.create({
  layer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{scaleY: -1}],
  },
  layerSub: {
    height: 250,
    width: 250,
    borderRadius: 5,
    padding: 10,
  },
  bottomText: {
    color: '#586e75',
    alignSelf: 'center',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  room_error: {
    color: '#dc143c',
    alignSelf: 'center',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 5,
  },
  highlight: {
    color: '#2B51C9',
    fontFamily: 'Inter-ExtraBold',
    textDecorationLine: 'underline',
  },
});

const MessagesRender = props => {
  const {globalStore} = useStore();
  const {chatStore} = useChatStore();
  const socket = useSocket();
  const forwardRef = useRef();
  const renderPropsMemo = useMemo(() => props, [props]);
  const FlatListType =
    renderPropsMemo?.useTabFlatlist === true ? Tabs.FlatList : FlatList;

  const renderIndexPath = useCallback(({item, index}) => {
    return (
      <View
        style={{
          transform: [{scaleY: -1}],
          ...renderPropsMemo?.messageMainLayerStyle,
        }}>
        <MessageEach message={item} index={index} messageTest={false} />
      </View>
    );
  }, []);

  const getMoreMessages = useCallback(() => {
    chatStore.setgetMoreMessages();
  }, []);

  const sendFirstMessage = useCallback(() => {
    chatStore?.setLocalMessage(
      sendFirstRoomMessage({
        message: 'Hello',
        chatUrl: chatStore?.chatswithDetailsLight.chatUrl,
        sender: globalStore.user.usersKey,
        details: {
          name: globalStore.user.usersName,
          profile: globalStore.user.usersProfile,
          key: globalStore.user.usersKey,
          userId: globalStore.user.refreshableKey,
          about: globalStore.user.about,
        },
      }),
    );
  }, []);

  const highlight = useCallback(
    string =>
      string.split(' ').map((word, i) => (
        <Text key={i} onPress={sendFirstMessage}>
          <Text style={styles.highlight}>{word} </Text>
          {NO_WIDTH_SPACE}
        </Text>
      )),
    [],
  );

  const onViewableItemsChanged = useCallback(({viewableItems}) => {
    chatStore.setonViewableItemsChanged({
      data: viewableItems,
      key: globalStore.user.usersKey,
      socket,
    });
  }, []);

  const handleOnScroll = useCallback(event => {
    const {
      nativeEvent: {
        contentOffset: {y: contentOffsetY},
        contentSize: {height: contentSizeHeight},
        layoutMeasurement: {height: layoutMeasurementHeight},
      },
    } = event;
    if (contentOffsetY > 200) {
      chatStore.setShowScrollHelper(true);
    } else {
      chatStore.setShowScrollHelper(false);
    }
  }, []);

  const renderListEmptyComponent = useCallback(() => {
    if (renderPropsMemo?.messages && renderPropsMemo?.messages.length !== 0)
      return null;
    return (
      <View
        style={[styles.layer, {...renderPropsMemo?.styleListEmptyComponent}]}>
        <View style={styles.layerSub}>
          {nothingToFind({
            value: require('../../../assets/51382-astronaut-light-theme.json'),
            isRemoteSearcher: true,
            styleAnimation: {marginTop: 0, height: 150},
            styleMainLayer: {marginTop: 0},
            bottomText: (
              <>
                <Text style={styles.bottomText}>
                  Nothing to find in this room, send {highlight('Hello')} to
                  begin...
                </Text>
                {chatStore?.room_error === true && (
                  <Text style={styles.room_error}>
                    {chatStore?.room_error_obj?.message}
                  </Text>
                )}
              </>
            ),
          })}
        </View>
      </View>
    );
  }, []);

  return (
    <FlatListType
      ref={e => {
        forwardRef.current = e;
        chatStore?.setMessagesRendererRef(e);
      }}
      data={renderPropsMemo?.messages}
      extraData={renderPropsMemo?.messages}
      onScroll={handleOnScroll}
      inverted={true}
      keyExtractor={(item, index) => item?._id.toString()}
      CellRendererComponent={renderIndexPath}
      onEndReached={getMoreMessages}
      scrollEventThrottle={100}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={_viewabilityConfig}
      ListEmptyComponent={renderListEmptyComponent}
      initialNumToRender={8}
      maxToRenderPerBatch={2}
      onEndReachedThreshold={0.5}
      {...{
        ...renderPropsMemo?.flatlistProps,
        ...{
          contentContainerStyle: {
            paddingBottom: 20,
            paddingTop: 20,
            ...renderPropsMemo?.flatlistProps.contentContainerStyle,
          },
        },
      }}
      keyboardDismissMode="interactive"
      automaticallyAdjustContentInsets={false}
      contentInsetAdjustmentBehavior="never"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
      automaticallyAdjustKeyboardInsets={true}
    />
  );
};
export default React.memo(MessagesRender);
