-- Add quiz_withdraw field to users table
ALTER TABLE `users` ADD COLUMN `quiz_withdraw` tinyint(1) DEFAULT 0 AFTER `is_quiz_reward_claimed`;

-- Update the user_view to include the new field
DROP VIEW IF EXISTS `user_view`;
CREATE ALGORITHM=UNDEFINED DEFINER=`u240376517_awin`@`127.0.0.1` SQL SECURITY DEFINER VIEW `user_view` AS 
SELECT 
    `u`.`id` AS `id`, 
    `u`.`token` AS `token`, 
    `u`.`name` AS `name`, 
    `u`.`email` AS `email`, 
    `u`.`phone` AS `phone`, 
    `u`.`shares` AS `shares`, 
    `u`.`clicks` AS `clicks`, 
    `u`.`is_terabox_done` AS `is_terabox_done`, 
    `u`.`is_quiz_reward_claimed` AS `is_quiz_reward_claimed`,
    `u`.`quiz_withdraw` AS `quiz_withdraw`,
    `u`.`invited_by` AS `invited_by`, 
    `u`.`created_on` AS `created_on`, 
    ifnull(sum(case when `t`.`type` = 'credit' then `t`.`amount` when `t`.`type` = 'debit' then -`t`.`amount` else 0 end),0) AS `balance` 
FROM (`users` `u` left join `transactions` `t` on(`u`.`id` = `t`.`user_id`)) 
GROUP BY `u`.`id`;
