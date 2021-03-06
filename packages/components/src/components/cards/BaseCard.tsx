import { getDateSmallText, getFullDateText, Theme } from '@devhub/core'
import React, { Fragment } from 'react'
import { PixelRatio, ScrollView, StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import { sharedStyles } from '../../styles/shared'
import {
  avatarSize,
  contentPadding,
  normalTextSize,
  scaleFactor,
  smallAvatarSize,
  smallerTextSize,
  smallTextSize,
} from '../../styles/variables'
import { fixColorHexWithoutHash } from '../../utils/helpers/colors'
import { vibrateHapticFeedback } from '../../utils/helpers/shared'
import { KeyboardKeyIsPressed } from '../AppKeyboardShortcuts'
import { getCardBackgroundThemeColor } from '../columns/ColumnRenderer'
import { Avatar } from '../common/Avatar'
import { ConditionalWrap } from '../common/ConditionalWrap'
import { IntervalRefresh } from '../common/IntervalRefresh'
import { Label, smallLabelHeight } from '../common/Label'
import { Link } from '../common/Link'
import { Spacer } from '../common/Spacer'
import { Text } from '../common/Text'
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText } from '../themed/ThemedText'
import { ThemedView } from '../themed/ThemedView'
import { BaseCardProps, renderCardActions, sizes } from './BaseCard.shared'
import { CardActions } from './partials/CardActions'
import {
  CardItemSeparator,
  cardItemSeparatorSize,
} from './partials/CardItemSeparator'
import { InstallGitHubAppText } from './partials/rows/InstallGitHubAppText'

const GestureHandlerTouchableOpacity = Platform.select({
  android: () => require('react-native-gesture-handler').TouchableOpacity,
  ios: () => require('react-native-gesture-handler').TouchableOpacity,
  default: () => require('../common/TouchableOpacity').TouchableOpacity,
})()

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },

  innerContainer: {
    width: '100%',
    height: '100%',
    paddingHorizontal: sizes.cardPaddingHorizontal,
    paddingVertical: sizes.cardPaddingVertical,
  },

  smallAvatarContainer: {
    position: 'relative',
    alignItems: 'flex-end',
    width: sizes.avatarContainerWidth,
    height: smallAvatarSize,
    paddingRight: sizes.avatarContainerWidth - avatarSize - smallAvatarSize / 2,
  },

  avatarContainer: {
    position: 'relative',
    width: sizes.avatarContainerWidth,
    height: sizes.avatarContainerHeight,
  },

  avatar: {},

  iconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: sizes.iconContainerSize,
    height: sizes.iconContainerSize,
    borderRadius: sizes.iconContainerSize / 2,
    borderWidth: 2 * scaleFactor,
  },

  icon: {
    marginLeft: 1 * scaleFactor,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: PixelRatio.roundToNearestPixel(
      sizes.iconContainerSize * (sizes.iconSize / sizes.iconContainerSize),
    ),
  },

  title: {
    flex: 1,
    height: sizes.titleLineHeight,
    lineHeight: sizes.titleLineHeight,
    fontSize: normalTextSize,
    // fontWeight: '500',
    overflow: 'hidden',
  },

  subtitle: {
    flexGrow: 1,
    lineHeight: sizes.subtitleLineHeight,
    fontSize: smallerTextSize,
    // fontWeight: '400',
    overflow: 'hidden',
  },

  text: {
    lineHeight: sizes.textLineHeight,
    fontSize: smallerTextSize,
    fontWeight: '300',
    overflow: 'hidden',
  },

  reason: {
    lineHeight: sizes.textLineHeight,
    fontSize: smallerTextSize,
    fontWeight: '300',
    textAlign: 'right',
  },

  timestampText: {
    lineHeight: sizes.titleLineHeight,
    fontSize: smallerTextSize,
    fontWeight: '300',
    overflow: 'hidden',
    // ...Platform.select({ web: { fontFeatureSettings: '"tnum"' } }),
  },

  actionContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    height: sizes.actionContainerHeight,
  },

  action: {
    flex: 1,
    lineHeight: sizes.actionFontSize + 2 * scaleFactor,
    fontSize: sizes.actionFontSize,
    fontWeight: '300',
    overflow: 'hidden',
  },

  labelText: {
    lineHeight: smallLabelHeight,
    fontSize: smallerTextSize,
    fontWeight: '300',
    overflow: 'hidden',
  },

  subitemContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    height: sizes.subitemContainerHeight,
  },

  subitem: {
    flex: 1,
    maxWidth: '100%',
    lineHeight: sizes.subitemLineHeight,
    fontSize: sizes.subitemFontSize,
    fontWeight: '400',
    overflow: 'hidden',
  },

  githubAppMessageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    height: sizes.githubAppMessageContainerHeight,
    minHeight: sizes.githubAppMessageContainerHeight,
  },

  githubAppMessage: {
    flexGrow: 1,
    maxWidth: '100%',
    lineHeight: sizes.subitemLineHeight,
    fontSize: sizes.subitemFontSize,
    fontWeight: '300',
    fontStyle: 'italic',
    overflow: 'hidden',
  },
})

export const BaseCard = React.memo((props: BaseCardProps) => {
  const {
    action,
    // appViewMode,
    height,

    avatar,
    columnId,
    date,
    githubApp,
    icon,
    isRead,
    isSaved,
    labels,
    link,
    nodeIdOrId,
    reason,
    showPrivateLock,
    subitems,
    subtitle,
    text,
    title,
    type,
  } = props

  if (!link)
    console.error(
      `No link for ${type} card: ${nodeIdOrId}, ${title}, ${text && text.text}`,
    )
  if (link && link.includes('api.github.com'))
    console.error(
      `Wrong link for ${type} card: ${nodeIdOrId}, ${title}, ${
        text && text.text
      }`,
      link,
    )

  const isMuted = false // appViewMode === 'single-column' ? false : isRead

  const backgroundThemeColor = (theme: Theme) =>
    getCardBackgroundThemeColor({
      isDark: theme.isDark,
      isMuted,
    })

  const dispatch = useDispatch()

  const textIsOnlyIssueNumber =
    text && text.text && text.text.match(/^#([0-9]+)$/)
  const issueNumber =
    textIsOnlyIssueNumber && Number(text!.text.match(/^#([0-9]+)$/)![1])

  return (
    <View
      key={`base-card-container-${type}-${nodeIdOrId}-inner`}
      style={[styles.container, { height }]}
    >
      <View
        style={[
          styles.innerContainer,
          { height: height - cardItemSeparatorSize },
        ]}
      >
        {!!(action && action.text) && (
          <>
            <View style={styles.actionContainer}>
              <View style={styles.smallAvatarContainer}>
                <Avatar
                  avatarUrl={action.avatar.imageURL}
                  disableLink={action.avatar.linkURL === link}
                  linkURL={action.avatar.linkURL}
                  style={styles.avatar}
                  size={smallAvatarSize}
                />
              </View>

              <Spacer width={sizes.horizontalSpaceSize} />

              <ThemedText
                color="foregroundColorMuted65"
                numberOfLines={1}
                style={styles.action}
              >
                {action.text}
              </ThemedText>
            </View>

            <Spacer height={sizes.verticalSpaceSize} />
          </>
        )}

        <View style={sharedStyles.horizontal}>
          <View style={styles.avatarContainer}>
            <Avatar
              avatarUrl={avatar.imageURL}
              disableLink={avatar.linkURL === link}
              linkURL={avatar.linkURL}
              style={styles.avatar}
              size={avatarSize}
            />

            <ThemedView
              backgroundColor={backgroundThemeColor}
              borderColor={backgroundThemeColor}
              style={styles.iconContainer}
            >
              <ThemedIcon
                {...icon}
                color={
                  icon.color ||
                  (isRead ? 'foregroundColorMuted65' : 'foregroundColor')
                }
                style={styles.icon}
              />
            </ThemedView>
          </View>

          <Spacer width={sizes.horizontalSpaceSize} />

          <View style={[sharedStyles.flex, sharedStyles.alignSelfCenter]}>
            <View style={sharedStyles.horizontalAndVerticallyAligned}>
              <ThemedText
                color={isRead ? 'foregroundColorMuted65' : 'foregroundColor'}
                numberOfLines={1}
                style={[styles.title, { fontWeight: isMuted ? '300' : '500' }]}
              >
                {title}
              </ThemedText>

              {!!showPrivateLock && (
                <>
                  <Text children="  " />
                  <ThemedIcon
                    family="octicon"
                    name="lock"
                    color="foregroundColorMuted65"
                    size={smallTextSize}
                  />
                </>
              )}

              <IntervalRefresh date={date}>
                {() => {
                  const dateText = getDateSmallText(date)
                  if (!dateText) return null

                  return (
                    <>
                      <Text children="  " />
                      <ThemedText
                        color="foregroundColorMuted65"
                        numberOfLines={1}
                        style={styles.timestampText}
                        {...Platform.select({
                          web: { title: getFullDateText(date) },
                        })}
                      >
                        {dateText.toLowerCase()}
                      </ThemedText>
                    </>
                  )
                }}
              </IntervalRefresh>

              {!!isSaved && (
                <>
                  <Text children="  " />
                  <ThemedIcon
                    family="octicon"
                    name="bookmark"
                    color="orange"
                    size={smallTextSize}
                  />
                </>
              )}

              {!isRead && (
                <>
                  <Text children="  " />
                  <ThemedIcon
                    family="octicon"
                    name="dot-fill"
                    color={(reason && reason.color) || 'primaryBackgroundColor'}
                    size={smallTextSize}
                  />
                </>
              )}
            </View>

            {!!subtitle && (
              <>
                <Spacer height={sizes.verticalSpaceSize} />

                <ThemedText
                  color={isRead ? 'foregroundColorMuted65' : 'foregroundColor'}
                  numberOfLines={1}
                  style={[
                    styles.subtitle,
                    { fontWeight: isMuted ? '300' : '400' },
                  ]}
                >
                  {subtitle}
                </ThemedText>
              </>
            )}

            {!!(text && text.text) && (
              <>
                <Spacer height={sizes.verticalSpaceSize} />

                <View
                  style={[
                    sharedStyles.horizontalAndVerticallyAligned,
                    sharedStyles.justifyContentSpaceBetween,
                    sharedStyles.fullWidth,
                    sharedStyles.fullMaxWidth,
                    { height: sizes.textLineHeight },
                  ]}
                >
                  {text.repo &&
                  text.repo.owner &&
                  text.repo.name &&
                  columnId ? (
                    <ConditionalWrap
                      condition={Platform.OS !== 'web'}
                      wrap={(c) => (
                        <View
                          style={[sharedStyles.flex, sharedStyles.flexWrap]}
                        >
                          {c}
                        </View>
                      )}
                    >
                      <Link
                        TouchableComponent={GestureHandlerTouchableOpacity}
                        enableUnderlineHover
                        href={
                          textIsOnlyIssueNumber && type === 'issue_or_pr'
                            ? undefined
                            : 'javascript:void(0)'
                        }
                        openOnNewTab={false}
                        onPress={(() => {
                          if (textIsOnlyIssueNumber && issueNumber) {
                            if (type === 'issue_or_pr') return

                            return () => {
                              vibrateHapticFeedback()

                              const removeIfAlreadySet = !(
                                KeyboardKeyIsPressed.meta ||
                                KeyboardKeyIsPressed.shift
                              )

                              const removeOthers = !(
                                KeyboardKeyIsPressed.alt ||
                                KeyboardKeyIsPressed.meta ||
                                KeyboardKeyIsPressed.shift
                              )

                              dispatch(
                                actions.changeIssueNumberFilter({
                                  columnId,
                                  issueNumber,
                                  removeIfAlreadySet,
                                  removeOthers,
                                  value: KeyboardKeyIsPressed.alt
                                    ? false
                                    : true,
                                }),
                              )
                            }
                          }

                          return () => {
                            vibrateHapticFeedback()

                            dispatch(
                              actions.setColumnRepoFilter({
                                columnId,
                                owner: text!.repo!.owner,
                                repo: text!.repo!.name,
                                value: KeyboardKeyIsPressed.alt ? false : true,
                                // removeIfAlreadySet,
                                // removeOthers,
                              }),
                            )
                          }
                        })()}
                        style={[
                          sharedStyles.flexShrink1,
                          sharedStyles.flexNoGrow,
                        ]}
                        textProps={{
                          color: 'foregroundColorMuted65',
                          numberOfLines: 1,
                          style: styles.text,
                        }}
                      >
                        {text.text}
                      </Link>
                    </ConditionalWrap>
                  ) : (
                    <ThemedText
                      color="foregroundColorMuted65"
                      numberOfLines={1}
                      style={[styles.text, sharedStyles.flex]}
                    >
                      {text.text}
                    </ThemedText>
                  )}

                  {!!(reason && reason.label && columnId) && (
                    <View
                      style={[
                        sharedStyles.horizontalAndVerticallyAligned,
                        sharedStyles.flexShrink0,
                      ]}
                    >
                      <Spacer width={contentPadding / 2} />

                      <Link
                        TouchableComponent={GestureHandlerTouchableOpacity}
                        enableUnderlineHover
                        href="javascript:void(0)"
                        openOnNewTab={false}
                        onPress={() => {
                          vibrateHapticFeedback()

                          const removeIfAlreadySet = !(
                            KeyboardKeyIsPressed.meta ||
                            KeyboardKeyIsPressed.shift
                          )

                          const removeOthers = !(
                            KeyboardKeyIsPressed.alt ||
                            KeyboardKeyIsPressed.meta ||
                            KeyboardKeyIsPressed.shift
                          )

                          dispatch(
                            actions.setColumnReasonFilter({
                              columnId,
                              reason: reason.reason,
                              value: KeyboardKeyIsPressed.alt ? false : true,
                              removeIfAlreadySet,
                              removeOthers,
                            }),
                          )
                        }}
                        style={sharedStyles.flexShrink0}
                        textProps={{
                          color: 'foregroundColorMuted65',
                          numberOfLines: 1,
                          style: [
                            styles.reason,
                            { minWidth: reason.label.length * 7 },
                          ],
                        }}
                        {...Platform.select({
                          web: { title: reason.tooltip },
                        })}
                      >
                        {reason.label.toLowerCase()}
                      </Link>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {!!(labels && labels.length) && (
          <>
            <Spacer height={sizes.verticalSpaceSize} />

            <View
              style={[
                sharedStyles.fullWidth,
                sharedStyles.fullMaxWidth,
                sharedStyles.horizontal,
                { height: smallLabelHeight },
              ]}
            >
              <Spacer
                width={sizes.avatarContainerWidth + sizes.horizontalSpaceSize}
              />

              <ScrollView
                alwaysBounceHorizontal={false}
                alwaysBounceVertical={false}
                data-scrollbar={false}
                horizontal
                style={sharedStyles.flex}
              >
                {labels.map((label, index) => (
                  <Fragment key={`${label.name}-${label.color}`}>
                    <Link
                      TouchableComponent={GestureHandlerTouchableOpacity}
                      enableUnderlineHover={false}
                      href="javascript:void(0)"
                      openOnNewTab={false}
                      onPress={
                        !columnId
                          ? undefined
                          : (() => {
                              return () => {
                                vibrateHapticFeedback()

                                const removeIfAlreadySet = !(
                                  KeyboardKeyIsPressed.meta ||
                                  KeyboardKeyIsPressed.shift
                                )

                                const removeOthers = !(
                                  KeyboardKeyIsPressed.alt ||
                                  KeyboardKeyIsPressed.meta ||
                                  KeyboardKeyIsPressed.shift
                                )

                                dispatch(
                                  actions.setColumnLabelFilter({
                                    columnId,
                                    label: label.name,
                                    value: KeyboardKeyIsPressed.alt
                                      ? false
                                      : true,
                                    removeIfAlreadySet,
                                    removeOthers,
                                  }),
                                )
                              }
                            })()
                      }
                      style={sharedStyles.flexShrink1}
                    >
                      <Label
                        colorThemeColor={fixColorHexWithoutHash(label.color)}
                        disableEmojis
                        small
                      >
                        {label.name.toLowerCase()}
                      </Label>
                    </Link>

                    {index < labels.length - 1 && (
                      <Spacer width={contentPadding / 2} />
                    )}
                  </Fragment>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {!!(subitems && subitems.length) &&
          subitems.map((subitem, index) => (
            <Fragment key={`base-card-subitem-${index}`}>
              <Spacer height={sizes.verticalSpaceSize} />

              <View style={styles.subitemContainer}>
                <View style={styles.smallAvatarContainer}>
                  {subitem.avatar && subitem.avatar.imageURL && (
                    <Avatar
                      avatarUrl={subitem.avatar.imageURL}
                      disableLink={subitem.avatar.linkURL === link}
                      linkURL={subitem.avatar.linkURL}
                      style={styles.avatar}
                      size={smallAvatarSize}
                    />
                  )}
                </View>

                <Spacer width={sizes.horizontalSpaceSize} />

                <ThemedText
                  color="foregroundColorMuted65"
                  numberOfLines={1}
                  style={styles.subitem}
                >
                  {subitem.text}
                </ThemedText>
              </View>
            </Fragment>
          ))}

        {!!githubApp && (
          <>
            <Spacer height={sizes.verticalSpaceSize} />

            <View style={styles.githubAppMessageContainer}>
              <Spacer
                width={sizes.avatarContainerWidth + sizes.horizontalSpaceSize}
              />

              <InstallGitHubAppText
                ownerId={githubApp.ownerId}
                repoId={githubApp.repoId}
                text={githubApp.text}
                textProps={{
                  color: 'foregroundColorMuted65',
                  numberOfLines: 1,
                  style: styles.githubAppMessage,
                }}
              />
            </View>
          </>
        )}

        {!!renderCardActions && (
          <>
            <Spacer height={sizes.verticalSpaceSize} />

            <CardActions
              commentsCount={
                undefined
                // issueOrPullRequest ? issueOrPullRequest.comments : undefined
              }
              commentsLink={link}
              isRead={isRead}
              isSaved={isSaved}
              itemNodeIdOrIds={[nodeIdOrId]}
              type={type}
            />
          </>
        )}

        <Spacer flex={1} />
      </View>

      <CardItemSeparator
        leftOffset={
          sizes.cardPaddingHorizontal +
          sizes.avatarContainerWidth +
          sizes.horizontalSpaceSize
        }
        muted={isMuted}
      />
    </View>
  )
})

BaseCard.displayName = 'BaseCard'
