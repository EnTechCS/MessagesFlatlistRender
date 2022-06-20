import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {FlatList} from 'react-native';
import {Tabs} from 'react-native-collapsible-tab-view';
import {toJS, computed} from 'mobx';
import {observer} from 'mobx-react-lite';
import {useChatStore} from '../store/chatStoreProvider';
import {UserContextProvider} from '../../user/userHook';
import {useMessagesRenderHook} from './messagesRenderHook';
import {generateItems} from './messageBrainer';

const _viewabilityConfig = {
  itemVisiblePercentThreshold: 50,
};

const MessagesRender = observer(props => {
  const {
    renderPropsMemo,
    renderMessage,
    getMoreMessages,
    renderListEmptyComponent,
    handleOnScroll,
    onViewableItemsChanged,
    setMessagesRendererRef,
  } = useMessagesRenderHook(props);
  const {chatStore} = useChatStore();
  const messageMemo = useMemo(() => {
    // https://github.com/mobxjs/mobx/discussions/3348#discussioncomment-2470109
    return computed(() =>
      generateItems({
        data: toJS(chatStore.messages),
        inRoom: toJS(chatStore?.allInCurrentRoomDetails),
        isDiscussionRoom: chatStore?.isDiscussionRoom,
      }),
    );
  }, []).get();

  const ToRenderLayer =
    renderPropsMemo.useUserContextProvider === false
      ? View
      : UserContextProvider;

  const FlatListType =
    renderPropsMemo?.useTabFlatlist === true ? Tabs.FlatList : FlatList;

  const renderItem = useCallback(({item, index}) => {
    return renderMessage({message: item});
  }, []);

  return (
    <ToRenderLayer>
      <FlatListType
        ref={setMessagesRendererRef}
        data={messageMemo}
        extraData={messageMemo}
        onScroll={handleOnScroll}
        inverted={true}
        keyExtractor={(item, index) => item?._id.toString()}
        CellRendererComponent={renderItem}
        onEndReached={getMoreMessages}
        scrollEventThrottle={100}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={_viewabilityConfig}
        ListEmptyComponent={renderListEmptyComponent}
        initialNumToRender={8}
        maxToRenderPerBatch={2}
        onEndReachedThreshold={0.5}
        windowSize={5}
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
    </ToRenderLayer>
  );
});
export default React.memo(MessagesRender);
